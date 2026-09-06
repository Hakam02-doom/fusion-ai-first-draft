import {
  remoteWorker,
  workerRequest,
  workerActions,
  remoteStorage,
  supportedWorkerActions,
} from '../server/worker/transport.js';
import {
  startJob,
  readJob,
  publicJob,
  cancelJob,
  artifact,
} from '../server/reconstruction/jobs.js';
import { browserProvider } from '../server/reconstruction/session.js';
import { workflowMode } from '../server/reconstruction/workflow.js';
import { allowedPreview } from '../server/browser.js';
import {
  advanceGeneration,
  canResumeGeneration,
  refreshGenerationDraft,
} from '../server/staged-generation.js';
import { aiConfigured, generationTimeoutMs } from '../server/model.js';
import { randomUUID, createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  ownerFrom,
  read,
  write,
  remove,
  keys,
  projectKey,
  cloudStorage,
} from '../server/storage.js';
import {
  categories,
  discover,
  categoryFor,
  rankCandidates,
} from '../server/marketplace.js';
import { inspectPreview, inspectGenerated } from '../server/browser.js';
import { generateSite, validateSite } from '../server/generate.js';
import { reactArchive } from '../server/export.js';
export const config = { maxDuration: 300 };
const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });
const identifier = (id) => {
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id || '')) throw fail('Invalid project.');
  return id;
};
async function bodyOf(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (Buffer.byteLength(data) > 3500000)
      throw fail('This request is too large.', 413);
  }
  try {
    return JSON.parse(data || '{}');
  } catch {
    throw fail('Invalid request body.');
  }
}
async function quota(owner) {
  const day = new Date().toISOString().slice(0, 10);
  const own = await keys(`usage/${day}/${owner}/`);
  if (own.length >= 15)
    throw fail(
      'This workspace has reached its daily limit of 15 generations.',
      429,
    );
  const limit = Number(process.env.FUSION_DAILY_LIMIT || 40);
  for (let n = 0; n < limit; n++) {
    try {
      await write(
        `budget/${day}/${n}.json`,
        { at: Date.now() },
        { exclusive: true },
      );
      await write(`usage/${day}/${owner}/${randomUUID()}.json`, {
        at: Date.now(),
      });
      return;
    } catch (e) {
      if (!/exist|already|overwrite/i.test(e.message) && e.code !== 'EEXIST')
        throw e;
    }
  }
  throw fail(
    'The builder has reached today’s generation limit. Try again tomorrow.',
    429,
  );
}
function slim(p) {
  const {
    versions: _versions,
    messages: _messages,
    generation: _generation,
    site,
    ...rest
  } = p;
  return { ...rest, hasSite: !!site };
}
async function projectFor(owner, id) {
  const p = await read(projectKey(owner, identifier(id)));
  if (!p || p.deleted)
    throw fail('This website was not found in your workspace.', 404);
  return refreshGenerationDraft(p);
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const url = new URL(req.url, 'http://localhost');
  const action = url.searchParams.get('action') || 'status';
  let started = false;
  try {
    if (
      process.env.FUSION_STORAGE_BACKEND === 'worker' &&
      !process.env.FUSION_WORKER_PROCESS &&
      !remoteWorker()
    )
      throw fail(
        'The local worker is not connected. Start the live test worker on your computer.',
        503,
      );
    if (action === 'status') {
      if (remoteWorker()) {
        let worker;
        try {
          worker = await (await workerRequest('status')).json();
        } catch {
          worker = {
            aiConfigured: false,
            reconstructionEnabled: false,
            browserProvider: 'unavailable',
          };
        }
        res.setHeader('Content-Type', 'application/json');
        return res.end(
          JSON.stringify({
            storage: remoteStorage()
              ? 'local-worker'
              : cloudStorage()
                ? 'cloud'
                : 'local-server',
            categories,
            aiConfigured: worker.aiConfigured,
            reconstructionEnabled: worker.reconstructionEnabled,
            browserProvider: worker.browserProvider,
            worker: worker.reconstructionEnabled ? 'connected' : 'unavailable',
          }),
        );
      }
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          storage: cloudStorage() ? 'cloud' : 'local-server',
          aiConfigured: await aiConfigured(),
          categories,
          reconstructionEnabled: !process.env.VERCEL,
          browserProvider: browserProvider(),
        }),
      );
    }
    if (remoteStorage()) {
      if (supportedWorkerActions().get(action) !== req.method)
        throw fail('Unknown action or method.', 404);
      if (!['asset', 'public'].includes(action)) ownerFrom(req);
      const body = req.method === 'GET' ? undefined : await bodyOf(req);
      if (action === 'upload')
        body._gatewayOrigin = `${process.env.VERCEL ? 'https' : 'http'}://${req.headers.host}`;
      const response = await workerRequest(action, {
        method: req.method,
        authorization: req.headers.authorization,
        body,
        params: Object.fromEntries(
          [...url.searchParams].filter(([key]) => key !== 'action'),
        ),
      });
      for (const name of ['content-type', 'content-disposition']) {
        const value = response.headers.get(name);
        if (value) res.setHeader(name, value);
      }
      // Captures and version history can exceed the buffered function payload limit.
      return await pipeline(Readable.fromWeb(response.body), res);
    }
    if (action === 'asset') {
      if (req.method !== 'GET') throw fail('Method not allowed', 405);
      const asset = await read(
        `assets/${identifier(url.searchParams.get('id'))}.json`,
      );
      if (!asset) throw fail('Image unavailable.', 404);
      const match = asset.data.match(
        /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/,
      );
      res.setHeader('Content-Type', match[1]);
      res.setHeader('Cache-Control', 'public,max-age=86400,immutable');
      return res.end(Buffer.from(match[2], 'base64'));
    }
    if (action === 'public') {
      if (req.method !== 'GET') throw fail('Method not allowed', 405);
      const shared = await read(
        `shares/${identifier(url.searchParams.get('id'))}.json`,
      );
      if (!shared || shared.revoked)
        throw fail('This shared website is unavailable.', 404);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ site: shared.site }));
    }
    const owner = ownerFrom(req);
    const body = req.method === 'GET' ? {} : await bodyOf(req);
    if (remoteWorker() && workerActions.has(action)) {
      const response = await workerRequest(action, {
        method: req.method,
        authorization: req.headers.authorization,
        body: req.method === 'GET' ? undefined : body,
        params: Object.fromEntries(
          [...url.searchParams].filter(([key]) => key !== 'action'),
        ),
      });
      res.setHeader(
        'Content-Type',
        response.headers.get('content-type') || 'application/json',
      );
      return await pipeline(Readable.fromWeb(response.body), res);
    }
    let result;
    if (action === 'reconstruction-job' && req.method === 'GET') {
      result = publicJob(
        await readJob(identifier(url.searchParams.get('job')), owner),
      );
    } else if (action === 'reconstruction-cancel' && req.method === 'POST') {
      result = await cancelJob(identifier(body.job), owner);
    } else if (action === 'reconstruction-artifact' && req.method === 'GET') {
      const bytes = await artifact(
        identifier(url.searchParams.get('job')),
        owner,
        url.searchParams.get('name'),
      );
      res.setHeader('Content-Type', 'image/png');
      return res.end(bytes);
    } else if (action === 'reconstruct' && req.method === 'POST') {
      let p = await projectFor(owner, body.id);
      const prompt =
        typeof body.prompt === 'string' ? body.prompt.trim() : p.prompt;
      if (!prompt || prompt.length > 6000)
        throw fail('Enter a request of up to 6,000 characters.');
      const mode = workflowMode(p, body);
      const editing = await read(`locks/${owner}/${p.id}.json`);
      if (editing && Date.now() - editing.at < generationTimeoutMs() + 60000)
        throw fail(
          'This website is already being updated. Wait for that request to finish.',
          409,
        );
      if (!p.reference && mode !== 'edit') {
        const catalog = await discover(p.category);
        const candidates = rankCandidates(
          catalog.items.filter((item) => allowedPreview(item.previewUrl)),
          p.prompt,
          p.id,
        );
        if (!candidates.length)
          throw fail(
            'No supported Framer previews were found in this category. Choose another category in References.',
          );
        p = { ...p, candidates, reference: candidates[0] };
        await write(projectKey(owner, p.id), p);
      }
      if (mode !== 'edit' && !allowedPreview(p.reference?.previewUrl))
        throw fail(
          'Choose a public Framer-hosted reference from the shortlist.',
        );
      const job = await startJob(
        owner,
        p,
        {
          prompt,
          mode,
          requestId: identifier(body.requestId || randomUUID()),
        },
        {
          beforeStart: ({ resuming }) => (resuming ? undefined : quota(owner)),
          onQueued: (queued) =>
            write(projectKey(owner, p.id), {
              ...p,
              generation: {
                engine: 'reconstruction',
                jobId: queued.id,
                mode,
                prompt,
                completed: queued.resumedFrom
                  ? p.generation?.completed || 0
                  : 0,
                total: queued.steps.length,
                draftSite: queued.resumedFrom
                  ? p.generation?.draftSite || null
                  : null,
              },
              generationError: null,
              failedPrompt: prompt,
              reconstruction: {
                ...(mode === 'edit' ? p.reconstruction : {}),
                comparisonJobId:
                  mode === 'edit'
                    ? p.reconstruction?.comparisonJobId ||
                      p.reconstruction?.jobId
                    : undefined,
                jobId: queued.id,
                status: queued.status,
                mode,
              },
            }),
        },
      );
      result = { job };
    } else if (action === 'projects' && req.method === 'GET') {
      const all = await keys(`workspaces/${owner}/projects/`);
      const projects = await Promise.all(all.slice(0, 100).map(read));
      result = {
        projects: projects
          .filter((p) => p && !p.deleted)
          .map(slim)
          .sort((a, b) => b.updatedAt - a.updatedAt),
      };
    } else if (action === 'project' && req.method === 'GET') {
      result = await projectFor(owner, url.searchParams.get('id'));
    } else if (action === 'create' && req.method === 'POST') {
      if (
        typeof body.prompt !== 'string' ||
        !body.prompt.trim() ||
        body.prompt.length > 6000
      )
        throw fail('Describe your website in 1–6,000 characters.');
      const all = await keys(`workspaces/${owner}/projects/`);
      if (all.length >= 100)
        throw fail('This workspace has reached its 100-project limit.');
      const id = randomUUID();
      result = {
        id,
        name: 'Untitled website',
        prompt: body.prompt.trim(),
        category: categories.includes(body.category)
          ? body.category
          : categoryFor(body.prompt),
        status: 'Draft',
        updatedAt: Date.now(),
        revision: 0,
        versions: [],
        messages: [],
        assets: [],
        activeVersion: -1,
        site: null,
      };
      await write(projectKey(owner, id), result);
    } else if (action === 'import' && req.method === 'POST') {
      const all = await keys(`workspaces/${owner}/projects/`);
      if (all.length >= 100)
        throw fail('This workspace has reached its 100-project limit.');
      const site = validateSite(body.site);
      const id = randomUUID();
      result = {
        id,
        name: site.title,
        prompt: String(body.prompt || site.description).slice(0, 6000),
        category: categoryFor(body.prompt || site.description),
        status: 'Draft',
        updatedAt: Date.now(),
        revision: 0,
        versions: [
          {
            id: randomUUID(),
            site,
            createdAt: Date.now(),
            prompt: 'Imported from the original local draft',
          },
        ],
        messages: [],
        assets: [],
        activeVersion: 0,
        site,
        imported: true,
      };
      await write(projectKey(owner, id), result);
    } else if (action === 'discover' && req.method === 'POST') {
      const p = await projectFor(owner, body.id);
      const catalog = await discover(
        categories.includes(body.category) ? body.category : p.category,
      );
      const seed = body.reroll ? randomUUID() : p.id;
      const candidates = rankCandidates(catalog.items, p.prompt, seed);
      result = {
        ...p,
        category: catalog.category,
        candidates,
        reference: candidates[0],
        catalogUpdatedAt: catalog.updatedAt,
        revision: p.revision + 1,
        updatedAt: Date.now(),
      };
      await write(projectKey(owner, p.id), result);
    } else if (action === 'select' && req.method === 'POST') {
      const p = await projectFor(owner, body.id);
      const reference = p.candidates?.find(
        (c) => c.listingUrl === body.listingUrl,
      );
      if (!reference)
        throw fail('Choose a reference from this project’s shortlist.');
      result = { ...p, reference, inspection: null, revision: p.revision + 1 };
      await write(projectKey(owner, p.id), result);
    } else if (action === 'generate' && req.method === 'POST') {
      const id = identifier(body.id);
      let p = await projectFor(owner, id);
      if (p.reconstruction?.jobId) {
        const active = remoteWorker()
          ? await (
              await workerRequest('reconstruction-job', {
                authorization: req.headers.authorization,
                params: { job: p.reconstruction.jobId },
              })
            )
              .json()
              .catch(() => null)
          : await readJob(p.reconstruction.jobId, owner).catch(() => null);
        if (active && ['queued', 'running'].includes(active.status))
          throw fail(
            'Reference reconstruction is still running. Wait for it to finish or stop it before editing.',
            409,
          );
      }
      if (
        typeof body.prompt !== 'string' ||
        !body.prompt.trim() ||
        body.prompt.length > 6000
      )
        throw fail('Enter a request of up to 6,000 characters.');
      const requestId = identifier(body.requestId);
      if (p.versions.some((v) => v.requestId === requestId)) {
        result = p;
      } else {
        const lock = `locks/${owner}/${id}.json`;
        const existing = await read(lock);
        if (
          existing &&
          Date.now() - existing.at < generationTimeoutMs() + 60000
        )
          throw fail(
            'This website is already being updated. Wait for that request to finish.',
            409,
          );
        if (existing) await remove(lock);
        try {
          await write(lock, { at: Date.now() }, { exclusive: true });
        } catch {
          throw fail('This website is already being updated.', 409);
        }
        const abort = new AbortController();
        const generationSignal = AbortSignal.any([
          abort.signal,
          AbortSignal.timeout(generationTimeoutMs()),
        ]);
        res.on('close', () => {
          if (!res.writableEnded) abort.abort();
        });
        try {
          if (!canResumeGeneration(p, body)) await quota(owner);
          res.setHeader('Content-Type', 'application/x-ndjson');
          res.setHeader('X-Accel-Buffering', 'no');
          res.statusCode = 200;
          started = true;
          const event = (value) => {
            if (!res.destroyed) res.write(JSON.stringify(value) + '\n');
          };
          if (!p.reference) {
            event({ stage: 'Finding relevant Framer templates' });
            const catalog = await discover(p.category);
            const candidates = rankCandidates(catalog.items, p.prompt, p.id);
            p = { ...p, candidates, reference: candidates[0] };
            await write(projectKey(owner, id), p);
          }
          let inspection = null;
          if (!p.site || body.redesign) {
            event({
              stage: 'Opening the live reference on desktop and mobile',
            });
            const cacheKey = `inspections/${createHash('sha256').update(p.reference.previewUrl).digest('hex')}.json`;
            inspection = await read(cacheKey);
            if (!inspection || Date.now() - inspection.timestamp > 604800000) {
              try {
                inspection = {
                  ...(await inspectPreview(p.reference)),
                  timestamp: Date.now(),
                };
                if (inspection.available) await write(cacheKey, inspection);
              } catch {
                inspection = {
                  available: false,
                  reason:
                    'The live preview could not be inspected. Generation will use the listing description.',
                };
              }
            }
            event({
              stage: inspection.available
                ? 'Reference inspected. Creating your website'
                : inspection.reason,
            });
          }
          if (abort.signal.aborted) throw fail('Generation cancelled.', 499);
          event({
            stage: p.site
              ? 'Applying your changes'
              : 'Writing your website design and content',
          });
          const assetData = await Promise.all(
            p.assets.map(async (a) => ({
              ...a,
              data: (await read(`assets/${a.id}.json`))?.data,
            })),
          );
          let site;
          if (
            process.env.FUSION_AI_PROVIDER === 'nvidia' &&
            (!p.site || body.redesign || canResumeGeneration(p, body))
          ) {
            const next = await advanceGeneration({
              project: p,
              body,
              inspection,
              assets: assetData,
              signal: generationSignal,
              onProgress: event,
              checkpoint: p.generation,
            });
            const current = await projectFor(owner, id);
            if (current.revision !== p.revision)
              throw fail(
                'This project changed in another tab. Reload before continuing.',
                409,
              );
            p = {
              ...current,
              generation: next.checkpoint,
              generationError: null,
              failedPrompt: body.prompt,
            };
            await write(projectKey(owner, id), p);
            event({
              stage: `Saved step ${next.checkpoint.completed} of 6`,
              checkpoint: {
                completed: next.checkpoint.completed,
                total: 6,
                draftSite: next.site,
              },
            });
            if (!next.complete) {
              event({ continuation: true });
              return res.end();
            }
            site = next.site;
          } else {
            site = await generateSite({
              prompt: body.prompt,
              reference: p.reference,
              inspection,
              previous: body.redesign ? null : p.site,
              assets: assetData,
              signal: generationSignal,
              onProgress: event,
            });
          }
          event({
            stage: 'Checking desktop, mobile, navigation and JavaScript',
          });
          let verification = await inspectGenerated(site, assetData);
          if (!verification.passed) {
            event({ stage: 'Fixing issues found in the browser checks' });
            site = await generateSite({
              prompt: body.prompt,
              reference: p.reference,
              previous: site,
              assets: assetData,
              repair: {
                checks: verification.checks,
                errors: verification.errors,
              },
              signal: generationSignal,
              onProgress: event,
            });
            verification = await inspectGenerated(site, assetData);
          }
          if (!verification.passed)
            throw fail(
              'The generated design did not pass browser checks. Your previous version is unchanged; try a clearer request.',
              422,
            );
          if (abort.signal.aborted) throw fail('Generation cancelled.', 499);
          const latest = await projectFor(owner, id);
          if (latest.revision !== p.revision)
            throw fail(
              'This project changed in another tab. Reload it before applying this request.',
              409,
            );
          const { thumbnail, ...validation } = verification;
          const version = {
            id: randomUUID(),
            requestId,
            site,
            createdAt: Date.now(),
            prompt: body.prompt,
          };
          const versions = [
            ...p.versions.slice(0, p.activeVersion + 1),
            version,
          ].slice(-12);
          result = {
            ...p,
            site,
            name: site.title,
            description: site.description,
            thumbnail,
            versions,
            activeVersion: versions.length - 1,
            validation,
            inspection: inspection
              ? {
                  available: inspection.available,
                  evidence: inspection.evidence,
                  reason: inspection.reason,
                  inspectedAt: inspection.inspectedAt,
                }
              : p.inspection,
            messages: [
              ...p.messages,
              { role: 'user', text: body.prompt },
              { role: 'assistant', text: site.reply, changed: true },
            ].slice(-80),
            status: 'Draft',
            generationError: null,
            generation: null,
            reconstruction: p.reconstruction
              ? { ...p.reconstruction, status: 'edited' }
              : null,
            failedPrompt: null,
            revision: p.revision + 1,
            updatedAt: Date.now(),
          };
          event({ stage: 'Saving your website and version history' });
          await write(projectKey(owner, id), result);
          event({ result });
          return res.end();
        } catch (e) {
          const saved = await projectFor(owner, id);
          await write(projectKey(owner, id), {
            ...saved,
            generationError:
              e.name === 'AbortError'
                ? 'Generation stopped. Your saved version is unchanged.'
                : e.message,
            failedPrompt: body.prompt,
          });
          throw e;
        } finally {
          await remove(lock);
        }
      }
    } else if (action === 'restore' && req.method === 'POST') {
      const p = await projectFor(owner, body.id);
      const version = p.versions[body.index];
      if (!version) throw fail('This version is unavailable.');
      result = {
        ...p,
        site: version.site,
        name: version.site.title,
        activeVersion: body.index,
        status: 'Draft',
        revision: p.revision + 1,
        updatedAt: Date.now(),
        thumbnail: null,
      };
      await write(projectKey(owner, p.id), result);
    } else if (action === 'rename' && req.method === 'POST') {
      const p = await projectFor(owner, body.id);
      const name = String(body.name || '')
        .trim()
        .slice(0, 100);
      if (!name) throw fail('Enter a website name.');
      result = { ...p, name, updatedAt: Date.now(), revision: p.revision + 1 };
      await write(projectKey(owner, p.id), result);
    } else if (action === 'duplicate' && req.method === 'POST') {
      const p = await projectFor(owner, body.id);
      result = {
        ...p,
        id: randomUUID(),
        name: p.name + ' copy',
        status: 'Draft',
        shareId: null,
        updatedAt: Date.now(),
        revision: 0,
      };
      await write(projectKey(owner, result.id), result);
    } else if (action === 'delete' && req.method === 'POST') {
      const p = await projectFor(owner, body.id);
      if (p.shareId) await write(`shares/${p.shareId}.json`, { revoked: true });
      await write(projectKey(owner, p.id), {
        ...p,
        deleted: true,
        updatedAt: Date.now(),
      });
      result = { deleted: true };
    } else if (action === 'upload' && req.method === 'POST') {
      const p = await projectFor(owner, body.id);
      if (
        !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(
          body.data || '',
        ) ||
        body.data.length > 1600000
      )
        throw fail('Choose a PNG, JPEG or WebP image smaller than 1.2 MB.');
      if (p.assets.length >= 6)
        throw fail('A project can contain up to six uploaded images.');
      const assetId = randomUUID();
      await write(`assets/${assetId}.json`, { data: body.data });
      const protocol = process.env.VERCEL ? 'https' : 'http';
      const origin =
        process.env.FUSION_WORKER_PROCESS && body._gatewayOrigin
          ? new URL(body._gatewayOrigin).origin
          : `${protocol}://${req.headers.host}`;
      const asset = {
        id: assetId,
        url: `${origin}/api/builder?action=asset&id=${assetId}`,
        description: String(body.name || 'Uploaded image').slice(0, 120),
      };
      result = {
        ...p,
        assets: [...p.assets, asset],
        revision: p.revision + 1,
        updatedAt: Date.now(),
      };
      await write(projectKey(owner, p.id), result);
    } else if (action === 'share' && req.method === 'POST') {
      const p = await projectFor(owner, body.id);
      if (!p.site) throw fail('Generate a website before publishing it.');
      const shareId = p.shareId || randomUUID();
      await write(`shares/${shareId}.json`, {
        site: validateSite(p.site),
        createdAt: Date.now(),
      });
      result = {
        ...p,
        shareId,
        status: 'Published',
        revision: p.revision + 1,
        updatedAt: Date.now(),
      };
      await write(projectKey(owner, p.id), result);
    } else if (action === 'unpublish' && req.method === 'POST') {
      const p = await projectFor(owner, body.id);
      if (p.shareId) await write(`shares/${p.shareId}.json`, { revoked: true });
      result = {
        ...p,
        shareId: null,
        status: 'Draft',
        revision: p.revision + 1,
      };
      await write(projectKey(owner, p.id), result);
    } else if (action === 'export' && req.method === 'POST') {
      const p = await projectFor(owner, body.id);
      if (!p.site) throw fail('Generate a website before exporting.');
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="fusion-website.zip"',
      );
      return res.end(
        Buffer.from(
          reactArchive(
            validateSite(p.site),
            await Promise.all(
              p.assets.map(async (a) => ({
                ...a,
                data: (await read(`assets/${a.id}.json`))?.data,
              })),
            ),
          ),
        ),
      );
    } else throw fail('Unknown action or method.', 404);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (e) {
    if (res.destroyed || res.writableEnded) return;
    if (res.headersSent && !started) return res.destroy();
    const message =
      e.name === 'ZodError'
        ? 'The design response was incomplete. Retry generation.'
        : e.message || 'Request failed. Please retry.';
    if (started) {
      if (!res.destroyed) res.end(JSON.stringify({ error: message }) + '\n');
    } else {
      res.statusCode = e.status || 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: message }));
    }
  }
}
