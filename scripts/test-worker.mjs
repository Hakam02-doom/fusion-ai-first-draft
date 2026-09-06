import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import {
  mkdtemp,
  mkdir,
  rm,
  readFile,
  writeFile,
  utimes,
} from 'node:fs/promises';
import path from 'node:path';
import {
  signedHeaders,
  requestVerifier,
  workerRequest,
} from '../server/worker/transport.js';
import { WorkerQueue } from '../server/worker/queue.js';
import { workerServer } from '../server/worker/http.js';
import {
  readJob,
  saveJob,
  startJob,
  jobPath,
  jobRoot,
  cancelJob,
  publicJob,
} from '../server/reconstruction/jobs.js';
import { read, write, projectKey } from '../server/storage.js';

const secret = randomBytes(32).toString('hex');
const owner = 'a'.repeat(64);
async function fixture(t, options = {}) {
  await mkdir('work', { recursive: true });
  const root = await mkdtemp(path.resolve('work/worker-unit-'));
  const saved = { ...process.env };
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.VERCEL;
  delete process.env.FUSION_JOB_RUN_ID;
  process.env.FUSION_WORKER_PROCESS = 'true';
  process.env.FUSION_JOB_DIR = path.join(root, 'jobs');
  process.env.FUSION_DATA_DIR = path.join(root, 'data');
  const children = [];
  const queue = new WorkerQueue({
    interval: 100000,
    launch: (job) => {
      const child = Object.assign(new EventEmitter(), {
        pid: 0,
        exitCode: null,
        signalCode: null,
        job,
      });
      child.kill = (signal) => {
        child.signalCode = signal;
        child.emit('exit', null, signal);
        return true;
      };
      children.push(child);
      return child;
    },
    ...options,
  });
  t.after(async () => {
    await queue.stop({ graceMs: 0 });
    process.env = saved;
    await rm(root, { recursive: true, force: true });
  });
  const enqueue = async (overrides = {}, callback) => {
    const project = {
      id: randomUUID(),
      revision: 0,
      prompt: 'A gym',
      versions: [],
      assets: [],
      ...overrides,
    };
    await write(projectKey(owner, project.id), project);
    const body = {
      mode: 'clone',
      prompt: project.prompt,
      requestId: randomUUID(),
    };
    const job = await startJob(owner, project, body, {
      onQueued: async (queued) => {
        await write(projectKey(owner, project.id), {
          ...project,
          reconstruction: { jobId: queued.id },
          generation: { jobId: queued.id },
        });
        await callback?.(queued);
      },
    });
    return { project, job, body };
  };
  return { queue, children, enqueue, root };
}

test('signed requests bind method, path, body and workspace identity; reject replays', () => {
  const request = {
    method: 'POST',
    path: '/api/builder?action=reconstruct',
    body: '{"id":"abc"}',
    authorization: `Bearer ${'b'.repeat(64)}`,
  };
  const headers = signedHeaders(secret, request);
  const req = { headers, method: request.method, url: request.path };
  for (const altered of [
    { ...req, method: 'GET' },
    { ...req, url: request.path + '&id=another' },
    {
      ...req,
      headers: { ...headers, authorization: `Bearer ${'c'.repeat(64)}` },
    },
  ])
    assert.throws(
      () => requestVerifier(secret)(altered, request.body),
      /Unauthorized/,
    );
  assert.throws(() => requestVerifier(secret)(req, '{}'), /Unauthorized/);
  assert.throws(
    () =>
      requestVerifier(secret)(
        { ...req, headers: { ...headers, 'x-fusion-time': '1000000000000' } },
        request.body,
      ),
    /Unauthorized/,
  );
  const verify = requestVerifier(secret);
  verify(req, request.body);
  assert.throws(() => verify(req, request.body), /Unauthorized/);
});

test('transport rejects insecure remote URLs and embedded credentials before sending', async (t) => {
  const old = process.env.FUSION_WORKER_URL;
  t.after(() => {
    if (old === undefined) delete process.env.FUSION_WORKER_URL;
    else process.env.FUSION_WORKER_URL = old;
  });
  for (const url of [
    'http://example.com',
    'https://user:pass@example.com',
    'https://example.com/wrong',
  ]) {
    process.env.FUSION_WORKER_URL = url;
    await assert.rejects(workerRequest('status'), /HTTPS origin/);
  }
});

test('managed queue persists admission and deduplicates before another quota reservation', async (t) => {
  const h = await fixture(t);
  const { project, job, body } = await h.enqueue();
  let charged = false;
  const again = await startJob(owner, project, body, {
    beforeStart: () => {
      charged = true;
    },
  });
  assert.equal(again.id, job.id);
  assert.equal(charged, false);
  assert.equal((await readJob(job.id)).ready, true);
  assert.equal(h.children.length, 0);
  await assert.rejects(
    startJob(owner, project, { ...body, prompt: 'Different' }),
    /Another request/,
  );
  const old = await readJob(job.id);
  await saveJob({
    ...old,
    updatedAt: Date.now() - 90000,
    createdAt: Date.now() - 90000,
  });
  assert.equal((await readJob(job.id, owner)).status, 'queued');
});

test('jobs and comparison artifacts remain scoped to their workspace', async (t) => {
  const h = await fixture(t);
  const { job } = await h.enqueue();
  await assert.rejects(readJob(job.id, 'b'.repeat(64)), { status: 404 });
  await assert.rejects(readJob(randomUUID(), owner), { status: 404 });
  const safe = publicJob(await readJob(job.id));
  for (const key of [
    'owner',
    'body',
    'lock',
    'pid',
    'runId',
    'managed',
    'ready',
  ])
    assert.equal(key in safe, false);
});

test('one worker slot enforces FIFO, and queued cancellation never launches a child', async (t) => {
  const h = await fixture(t);
  const first = await h.enqueue();
  const second = await h.enqueue();
  const third = await h.enqueue();
  await h.queue.start();
  assert.equal(h.children.length, 1);
  assert.equal(h.children[0].job.id, first.job.id);
  await cancelJob(second.job.id, owner);
  await h.queue.tick();
  assert.equal((await readJob(second.job.id)).status, 'cancelled');
  assert.equal(h.children.length, 1);
  await saveJob({ ...(await readJob(first.job.id)), status: 'completed' });
  h.children[0].kill('SIGTERM');
  await h.queue.tick();
  assert.equal(h.children.length, 2);
  assert.equal(h.children[1].job.id, third.job.id);
});

test('an in-flight child cannot be launched twice if it queues itself during shutdown', async (t) => {
  const h = await fixture(t, { concurrency: 2 });
  const { job } = await h.enqueue();
  await h.queue.start();
  await saveJob({ ...(await readJob(job.id)), status: 'queued' });
  await h.queue.tick();
  assert.equal(h.children.length, 1);
});

test('restart retains checkpoint and model response, then resumes with a new fenced attempt', async (t) => {
  const h = await fixture(t);
  const { job } = await h.enqueue();
  await h.queue.start();
  const firstRun = (await readJob(job.id)).runId;
  await writeFile(
    path.join(jobPath(job.id), 'workflow.json'),
    '{"checkpoint":"saved"}',
  );
  await h.queue.stop({ graceMs: 0 });
  const queue2 = new WorkerQueue({ interval: 100000, launch: h.queue.launch });
  t.after(() => queue2.stop({ graceMs: 0 }));
  await queue2.start();
  const recovered = await readJob(job.id);
  assert.equal(recovered.attempt, 2);
  assert.notEqual(recovered.runId, firstRun);
  assert.equal(
    await readFile(path.join(jobPath(job.id), 'workflow.json'), 'utf8'),
    '{"checkpoint":"saved"}',
  );
  process.env.FUSION_JOB_RUN_ID = firstRun;
  await assert.rejects(saveJob(recovered), /superseded/);
  delete process.env.FUSION_JOB_RUN_ID;
  await queue2.stop({ graceMs: 0 });
});

test('crash after project commit is recovered without creating a duplicate version', async (t) => {
  const h = await fixture(t);
  const { project, job } = await h.enqueue();
  const committed = {
    ...(await read(projectKey(owner, project.id))),
    revision: 1,
    versions: [{ jobId: job.id }],
  };
  await write(projectKey(owner, project.id), committed);
  await saveJob({ ...(await readJob(job.id)), status: 'running', attempt: 1 });
  await h.queue.start();
  assert.equal((await readJob(job.id)).status, 'completed');
  assert.equal(h.children.length, 0);
  assert.equal((await read(projectKey(owner, project.id))).versions.length, 1);
});

test('crash between project admission and ready marker is recovered', async (t) => {
  const h = await fixture(t);
  const { job } = await h.enqueue();
  await saveJob({ ...(await readJob(job.id)), ready: false });
  await h.queue.start();
  assert.equal(h.children.length, 1);
});

test('revision changes stop a queued job rather than overwriting a newer project', async (t) => {
  const h = await fixture(t);
  const { project, job } = await h.enqueue();
  await write(projectKey(owner, project.id), { ...project, revision: 2 });
  await h.queue.start();
  assert.equal((await readJob(job.id)).status, 'failed');
  assert.equal(h.children.length, 0);
  assert.equal((await read(projectKey(owner, project.id))).revision, 2);
});

test('repeated process crashes stop after three attempts with the checkpoint intact', async (t) => {
  const h = await fixture(t);
  const { job } = await h.enqueue();
  await saveJob({ ...(await readJob(job.id)), status: 'running', attempt: 3 });
  await h.queue.start();
  assert.equal((await readJob(job.id)).status, 'failed');
  assert.match((await readJob(job.id)).error, /restarted repeatedly/);
  assert.equal(h.children.length, 0);
});

test('a second supervisor cannot take a live volume; expired leases are recoverable', async (t) => {
  const h = await fixture(t);
  await h.queue.start();
  const second = new WorkerQueue();
  await assert.rejects(second.start(), /Another worker/);
  const lease = path.join(jobRoot(), 'supervisor', 'lease.json');
  await utimes(lease, new Date(0), new Date(0));
  await second.start();
  await assert.rejects(h.queue.tick(), /ownership changed/);
  await second.stop();
});

test('worker HTTP rejects unsigned requests, forbidden actions and oversized bodies', async (t) => {
  let invoked = 0;
  const queue = { ready: true };
  const server = workerServer({
    queue,
    secret,
    handler: (_req, res) => {
      invoked++;
      res.end('{"ok":true}');
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${origin}/healthz`)).status, 200);
  assert.equal(
    (await fetch(`${origin}/api/builder?action=status`)).status,
    401,
  );
  assert.equal(
    (await fetch(`${origin}/api/builder?action=projects`)).status,
    404,
  );
  assert.equal(
    (
      await fetch(`${origin}/api/builder?action=reconstruct`, {
        method: 'POST',
        body: 'x'.repeat(66000),
      })
    ).status,
    413,
  );
  const pathname = '/api/builder?action=status';
  const headers = signedHeaders(secret, { method: 'GET', path: pathname });
  assert.equal((await fetch(origin + pathname, { headers })).status, 200);
  assert.equal((await fetch(origin + pathname, { headers })).status, 401);
  assert.equal(invoked, 1);
  queue.ready = false;
  assert.equal((await fetch(`${origin}/healthz`)).status, 503);
});

test('queue admission enforces global and workspace capacity while accepting idempotent retries', async (t) => {
  const h = await fixture(t);
  const { ownerFrom } = await import('../server/storage.js');
  const authorization = `Bearer ${randomBytes(32).toString('hex')}`;
  const actualOwner = ownerFrom({ headers: { authorization } });
  const first = await h.enqueue();
  await saveJob({ ...(await readJob(first.job.id)), owner: actualOwner });
  let calls = 0;
  const server = workerServer({
    queue: { ready: true },
    secret,
    handler: (_req, res) => {
      calls++;
      res.end('{}');
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const pathname = '/api/builder?action=reconstruct';
  const send = (id) => {
    const body = JSON.stringify({ id });
    return fetch(`http://127.0.0.1:${server.address().port}${pathname}`, {
      method: 'POST',
      body,
      headers: signedHeaders(secret, {
        method: 'POST',
        path: pathname,
        authorization,
        body,
      }),
    });
  };
  process.env.FUSION_WORKER_MAX_PENDING = '1';
  assert.equal((await send(randomUUID())).status, 429);
  assert.equal((await send(first.project.id)).status, 200);
  assert.equal(calls, 1);
  process.env.FUSION_WORKER_MAX_PENDING = '20';
  for (let n = 0; n < 2; n++) {
    const { job } = await h.enqueue();
    await saveJob({ ...(await readJob(job.id)), owner: actualOwner });
  }
  const rejected = await send(randomUUID());
  assert.equal(rejected.status, 429);
  assert.match((await rejected.json()).error, /three websites/);
});

test('chat reconnects after worker downtime and preserves completed progress', async (t) => {
  const { watchReconstruction } =
    await import('../src/components/builder/client.js');
  const originalFetch = globalThis.fetch,
    originalStorage = globalThis.localStorage,
    originalTimer = globalThis.setTimeout;
  globalThis.localStorage = { getItem: () => 'a'.repeat(64) };
  globalThis.setTimeout = (fn, _ms, ...args) => originalTimer(fn, 0, ...args);
  t.after(() => {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalStorage;
    globalThis.setTimeout = originalTimer;
  });
  let polls = 0;
  globalThis.fetch = async (url) => {
    if (url.includes('action=project'))
      return Response.json({ id: 'project', site: { title: 'Gym' } });
    polls++;
    if (polls === 1)
      return Response.json({ error: 'Worker restarting' }, { status: 503 });
    if (polls === 2) throw new TypeError('Network error');
    return Response.json({
      id: 'job',
      status: 'completed',
      stage: 'Your website is ready',
    });
  };
  const stages = [];
  const result = await watchReconstruction('project', 'job', (stage) =>
    stages.push(stage),
  );
  assert.equal(result.site.title, 'Gym');
  assert.equal(polls, 3);
  assert.match(stages[0], /Reconnecting/);
  assert.equal(stages.at(-1), 'Your website is ready');
  globalThis.fetch = async () =>
    Response.json({ error: 'Wrong workspace' }, { status: 401 });
  await assert.rejects(
    watchReconstruction('project', 'job', () => {}),
    /Wrong workspace/,
  );
});
