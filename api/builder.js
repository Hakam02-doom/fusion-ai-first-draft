import { aiConfigured } from '../server/model.js';
import { randomUUID, createHash } from 'node:crypto';
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
  const { versions: _versions, messages: _messages, site, ...rest } = p;
  return { ...rest, hasSite: !!site };
}
async function projectFor(owner, id) {
  const p = await read(projectKey(owner, identifier(id)));
  if (!p || p.deleted)
    throw fail('This website was not found in your workspace.', 404);
  return p;
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const url = new URL(req.url, 'http://localhost');
  const action = url.searchParams.get('action') || 'status';
  let started = false;
  try {
    if (action === 'status') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          storage: cloudStorage() ? 'cloud' : 'local-server',
          aiConfigured: await aiConfigured(),
          categories,
        }),
      );
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
    let result;
    if (action === 'projects' && req.method === 'GET') {
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
        if (existing && Date.now() - existing.at < 330000)
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
        res.on('close', () => {
          if (!res.writableEnded) abort.abort();
        });
        try {
          await quota(owner);
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
          let site = await generateSite({
            prompt: body.prompt,
            reference: p.reference,
            inspection,
            previous: body.redesign ? null : p.site,
            assets: assetData,
            signal: abort.signal,
          });
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
              signal: abort.signal,
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
            failedPrompt: null,
            revision: p.revision + 1,
            updatedAt: Date.now(),
          };
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
      const asset = {
        id: assetId,
        url: `${protocol}://${req.headers.host}/api/builder?action=asset&id=${assetId}`,
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
