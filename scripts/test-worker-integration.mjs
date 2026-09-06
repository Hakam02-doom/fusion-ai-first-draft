import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, rm, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ownerFrom, projectKey, read, write } from '../server/storage.js';
import { jobPath, saveJob } from '../server/reconstruction/jobs.js';
import { workflowFingerprint } from '../server/reconstruction/workflow.js';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function start(script, env) {
  const child = fork(script, [], {
    env,
    stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr = (stderr + chunk).slice(-2000);
  });
  const port = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(Error('Service did not start.'));
    }, 20000);
    child.once('message', (message) => {
      clearTimeout(timeout);
      resolve(message.port);
    });
    child.once('exit', (code) => {
      clearTimeout(timeout);
      reject(Error(`Service exited (${code}): ${stderr}`));
    });
    child.once('error', reject);
  });
  return { child, port };
}
async function stop(service) {
  if (!service || service.child.exitCode !== null || service.child.signalCode)
    return;
  const exited = new Promise((resolve) => service.child.once('exit', resolve));
  service.child.kill('SIGTERM');
  await exited;
}

for (const localStorage of [false, true])
  test(
    `Vercel gateway → separate worker → durable save and restart (${localStorage ? 'all data on worker' : 'shared storage'})`,
    { timeout: 120000 },
    async (t) => {
      await mkdir('work', { recursive: true });
      const root = await mkdtemp(path.resolve('work/worker-integration-'));
      const original = { ...process.env };
      const env = {
        ...process.env,
        NODE_ENV: 'test',
        PORT: '0',
        FUSION_WORKER_SECRET: randomBytes(32).toString('hex'),
        FUSION_JOB_DIR: path.join(root, 'worker-jobs'),
        FUSION_DATA_DIR: path.join(root, 'data'),
        FUSION_BROWSER_PROVIDER: 'local',
        FUSION_WORKER_CONCURRENCY: '1',
        FUSION_AI_PROVIDER: 'nvidia',
        FUSION_MODEL: 'moonshotai/kimi-k3',
        FUSION_ALLOW_PAID_MODELS: 'false',
        FUSION_STORAGE_BACKEND: localStorage ? 'local' : '',
      };
      for (const key of [
        'BLOB_READ_WRITE_TOKEN',
        'VERCEL',
        'FUSION_WORKER_URL',
        'FUSION_WORKER_PROCESS',
        'FUSION_JOB_RUN_ID',
        'NVIDIA_API_KEY',
        'OPENROUTER_API_KEY',
        'SILICONFLOW_API_KEY',
        'OPENAI_API_KEY',
        'AI_GATEWAY_API_KEY',
        'BROWSERBASE_API_KEY',
      ])
        delete env[key];
      if (localStorage) env.BLOB_READ_WRITE_TOKEN = 'must-never-be-used';
      process.env = { ...env };
      let worker;
      const services = {};
      t.after(async () => {
        await stop(services.gateway);
        await stop(worker);
        process.env = original;
        await rm(root, { recursive: true, force: true });
      });
      const token = randomBytes(32).toString('hex');
      const authorization = `Bearer ${token}`;
      const owner = ownerFrom({ headers: { authorization } });
      const projectId = randomUUID(),
        previousId = randomUUID();
      const html =
        '<nav><strong>FORGE</strong><a href="#training">Training</a></nav><main><h1>Train with purpose.</h1><p>A gym built around your progress.</p><a href="#training">Explore training</a><section id="training"><h2>Strength. Conditioning. Community.</h2></section></main>';
      const css =
        'html{scroll-behavior:smooth}body{margin:0;background:#171915;color:#edeee4;font:18px Arial}nav{display:flex;justify-content:space-between;padding:24px}main{padding:24px}h1{font-size:clamp(40px,8vw,100px)}a{color:#dfff7f}section{padding:80px 0}';
      const site = {
        title: 'FORGE worker test',
        description: 'Gym integration fixture',
        html,
        css,
        js: '',
        reply: 'Updated the gym.',
        variants: [1440, 768, 390].map((width) => ({
          width,
          minWidth: width === 1440 ? 1100 : width === 768 ? 680 : 0,
          html,
          css,
          js: '',
        })),
      };
      const body = {
        id: projectId,
        mode: 'edit',
        prompt: 'Keep the saved gym design and finish its browser checks.',
        requestId: randomUUID(),
      };
      const project = {
        id: projectId,
        revision: 0,
        prompt: body.prompt,
        name: site.title,
        site,
        assets: [],
        versions: [],
        activeVersion: -1,
        messages: [],
        generation: { jobId: previousId, completed: 1, draftSite: site },
        reconstruction: { jobId: previousId },
      };
      const fingerprint = workflowFingerprint(project, body);
      await write(projectKey(owner, projectId), project);
      await saveJob({
        id: previousId,
        owner,
        project: projectId,
        body,
        mode: 'edit',
        fingerprint,
        status: 'failed',
        revision: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        events: [],
      });
      await writeFile(
        path.join(jobPath(previousId), 'workflow.json'),
        JSON.stringify({
          fingerprint,
          state: { version: 1, completed: ['editing'], site },
        }),
      );
      const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=',
        'base64',
      );
      await writeFile(
        path.join(jobPath(previousId), 'reference-1440.png'),
        png,
      );
      worker = await start('scripts/worker-server.mjs', env);
      const workerUrl = `http://127.0.0.1:${worker.port}`;
      const gatewayJobs = path.join(root, 'gateway-must-not-spawn');
      const gateway = (services.gateway = await start(
        'scripts/fixtures/worker-gateway.mjs',
        {
          ...env,
          VERCEL: '1',
          FUSION_WORKER_URL: workerUrl,
          FUSION_JOB_DIR: gatewayJobs,
          ...(localStorage
            ? {
                FUSION_STORAGE_BACKEND: 'worker',
                BLOB_READ_WRITE_TOKEN: 'must-never-be-used',
              }
            : {}),
        },
      ));
      const base = `http://127.0.0.1:${gateway.port}/api/builder`;
      const request = (action, options = {}) =>
        fetch(`${base}?${new URLSearchParams({ action, ...options.params })}`, {
          method: options.body ? 'POST' : 'GET',
          headers: {
            authorization: options.authorization || authorization,
            'content-type': 'application/json',
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });
      assert.equal(
        (await fetch(workerUrl + '/api/builder?action=status')).status,
        401,
      );
      const configured = await (await request('status')).json();
      assert.equal(configured.worker, 'connected');
      assert.equal(configured.reconstructionEnabled, true);
      if (localStorage) {
        assert.equal(configured.storage, 'local-worker');
        const created = await (
          await request('create', { body: { prompt: 'A local-only test gym' } })
        ).json();
        assert.ok(created.id);
        const renamed = await (
          await request('rename', {
            body: { id: created.id, name: 'Local test gym' },
          })
        ).json();
        assert.equal(renamed.name, 'Local test gym');
        const listed = await (await request('projects')).json();
        assert.ok(listed.projects.some((project) => project.id === created.id));
        const payload =
          'data:image/png;base64,' + Buffer.alloc(60000).toString('base64');
        const uploaded = await (
          await request('upload', {
            body: { id: created.id, name: 'Test image', data: payload },
          })
        ).json();
        assert.ok(
          uploaded.assets?.[0]?.url?.startsWith(
            `https://127.0.0.1:${gateway.port}/api/builder?`,
          ),
        );
        const asset = await request('asset', {
          params: { id: uploaded.assets[0].id },
          authorization: 'none',
        });
        assert.equal(asset.status, 200);
        assert.equal((await asset.arrayBuffer()).byteLength, 60000);
        assert.equal(
          (
            await request('create', {
              body: { prompt: 'Unauthenticated' },
              authorization: 'none',
            })
          ).status,
          401,
        );
        assert.equal(
          (
            await request('project', {
              params: { id: created.id },
              authorization: `Bearer ${randomBytes(32).toString('hex')}`,
            })
          ).status,
          404,
        );
      }
      const submitted = await request('reconstruct', { body });
      assert.equal(submitted.status, 200, await submitted.clone().text());
      const { job } = await submitted.json();
      assert.equal(job.resumedFrom, previousId);
      assert.equal(
        (await (await request('reconstruct', { body })).json()).job.id,
        job.id,
      );
      const stages = new Set();
      let current;
      const poll = async () => {
        const response = await request('reconstruction-job', {
          params: { job: job.id },
        });
        assert.equal(response.status, 200);
        current = await response.json();
        stages.add(current.stage);
        assert.ok(
          !['failed', 'cancelled', 'needs-correction'].includes(current.status),
          current.error || current.stage,
        );
      };
      for (let n = 0; n < 150; n++) {
        await poll();
        if (current.phase === 'checking') break;
        await pause(100);
      }
      assert.equal(current.phase, 'checking');
      const workerPort = worker.port;
      await stop(worker);
      const unavailable = await (await request('status')).json();
      assert.equal(unavailable.reconstructionEnabled, false);
      worker = await start('scripts/worker-server.mjs', {
        ...env,
        PORT: String(workerPort),
      });
      for (let n = 0; n < 250; n++) {
        await poll();
        if (current.status === 'completed') break;
        await pause(200);
      }
      assert.equal(current.status, 'completed', current.error || current.stage);
      assert.equal(current.attempt, 2);
      assert.ok(stages.size >= 3);
      const saved = await read(projectKey(owner, projectId));
      assert.equal(saved.versions.length, 1);
      assert.equal(saved.versions[0].jobId, job.id);
      assert.equal(saved.revision, 1);
      assert.equal(saved.generation, null);
      assert.equal(saved.validation.passed, true);
      if (localStorage) {
        const fetched = await (
          await request('project', { params: { id: projectId } })
        ).json();
        assert.equal(fetched.versions.length, 1);
        const archive = await request('export', { body: { id: projectId } });
        assert.equal(archive.status, 200);
        assert.equal(archive.headers.get('content-type'), 'application/zip');
        assert.ok(
          archive.headers
            .get('content-disposition')
            ?.includes('fusion-website.zip'),
        );
        assert.ok((await archive.arrayBuffer()).byteLength > 1000);
        const shared = await (
          await request('share', { body: { id: projectId } })
        ).json();
        const publicSite = await (
          await request('public', {
            params: { id: shared.shareId },
            authorization: 'none',
          })
        ).json();
        assert.equal(publicSite.site.title, site.title);
      }
      assert.deepEqual(
        saved.validation.checks.map((check) => check.width),
        [1440, 768, 390],
      );
      const image = await request('reconstruction-artifact', {
        params: { job: job.id, name: 'reference-1440.png' },
      });
      assert.equal(image.headers.get('content-type'), 'image/png');
      assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
      const stranger = `Bearer ${randomBytes(32).toString('hex')}`;
      assert.equal(
        (
          await request('reconstruction-job', {
            params: { job: job.id },
            authorization: stranger,
          })
        ).status,
        404,
      );
      assert.equal(
        (
          await request('reconstruction-artifact', {
            params: { job: job.id, name: 'reference-1440.png' },
            authorization: stranger,
          })
        ).status,
        404,
      );
      assert.equal(
        (
          await request('reconstruction-cancel', {
            body: { job: job.id },
            authorization: stranger,
          })
        ).status,
        404,
      );
      assert.equal(
        (await (await request('reconstruct', { body })).json()).job.id,
        job.id,
      );
      assert.equal(
        (await read(projectKey(owner, projectId))).versions.length,
        1,
      );
      assert.deepEqual(await readdir(gatewayJobs).catch(() => []), []);
      t.diagnostic(
        'Real browser checks passed at 1440, 768 and 390px after restarting the worker mid-job. Exactly one version saved; no model call made (saved editing checkpoint).',
      );
    },
  );
