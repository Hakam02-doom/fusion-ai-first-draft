import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  runWorkflow,
  workflowMode,
  workflowFingerprint,
} from '../server/reconstruction/workflow.js';
import { watchReconstruction } from '../src/components/builder/client.js';
const site = {
  title: 'Reference',
  description: 'Reference',
  html: '<h1>Original</h1>',
  css: 'body{color:black}',
  js: '',
  reply: 'Done',
  variants: [
    {
      width: 1440,
      minWidth: 0,
      html: '<h1>Original</h1>',
      css: 'body{color:black}',
      js: '',
    },
  ],
};
const project = {
  revision: 3,
  reference: { previewUrl: 'https://verseo.framer.website/' },
  assets: [],
  site,
};
function harness(overrides = {}) {
  const calls = [],
    states = [],
    events = [];
  const services = {
    capture: async () => {
      calls.push('capture');
      return { interactions: [], warnings: [] };
    },
    assemble: async () => {
      calls.push('assemble');
      return structuredClone(site);
    },
    compare: async () => {
      calls.push('compare');
      return { passed: true, checks: [] };
    },
    aiConfigured: async () => true,
    edit: async (options) => {
      calls.push(options.personalize ? 'personalize' : 'edit');
      return { ...options.previous, title: 'My business' };
    },
    verify: async () => {
      calls.push('verify');
      return { passed: true, checks: [] };
    },
    onCheckpoint: async (state) => states.push(structuredClone(state)),
    onEvent: async (event) => events.push(structuredClone(event)),
    ...overrides,
  };
  return { services, calls, states, events };
}
test('build reconstructs and compares before applying the brief and validating', async () => {
  const h = harness();
  const result = await runWorkflow(
    { project, body: { mode: 'build', prompt: 'My business' } },
    h.services,
  );
  assert.equal(result.status, 'completed');
  assert.deepEqual(h.calls, [
    'capture',
    'assemble',
    'compare',
    'personalize',
    'verify',
  ]);
  assert.equal(result.state.site.title, 'My business');
  assert.equal(h.events.at(-1).phase, 'saving');
});
test('an exact clone never personalizes and edits do not recapture the reference', async () => {
  const clone = harness();
  await runWorkflow(
    { project, body: { mode: 'clone', prompt: 'Clone' } },
    clone.services,
  );
  assert.deepEqual(clone.calls, ['capture', 'assemble', 'compare']);
  const edit = harness();
  await runWorkflow(
    { project, body: { mode: 'edit', prompt: 'Change title' } },
    edit.services,
  );
  assert.deepEqual(edit.calls, ['edit', 'verify']);
});
test('a provider failure resumes after comparison without recapturing or changing the saved site', async () => {
  const failed = harness({
    edit: async () => {
      throw Error('Provider unavailable');
    },
  });
  await assert.rejects(
    () =>
      runWorkflow(
        { project, body: { mode: 'build', prompt: 'Business' } },
        failed.services,
      ),
    /Provider unavailable/,
  );
  const checkpoint = failed.states.at(-1);
  assert.equal(checkpoint.comparison.passed, true);
  assert.equal(project.site.title, 'Reference');
  const resumed = harness();
  const result = await runWorkflow(
    { project, body: { mode: 'build', prompt: 'Business' }, checkpoint },
    resumed.services,
  );
  assert.equal(result.status, 'completed');
  assert.deepEqual(resumed.calls, ['personalize', 'verify']);
});
test('a failed final browser check retains a draft and has a bounded repair', async () => {
  const h = harness({
    verify: async () => {
      h.calls.push('verify');
      return { passed: false, checks: [{ overflow: true }] };
    },
  });
  const result = await runWorkflow(
    { project, body: { mode: 'build', prompt: 'Business' } },
    h.services,
  );
  assert.equal(result.status, 'needs-correction');
  assert.equal(h.calls.filter((v) => v === 'edit').length, 1);
  assert.ok(result.state.editRepairAttempted);
  assert.notEqual(h.events.at(-1).phase, 'saving');
});
test('cancellation after a checkpoint prevents subsequent provider calls', async () => {
  const abort = new AbortController();
  const h = harness({
    onCheckpoint: async () => abort.abort(new Error('Stopped')),
  });
  await assert.rejects(
    () =>
      runWorkflow(
        {
          project,
          body: { mode: 'build', prompt: 'Business' },
          signal: abort.signal,
        },
        h.services,
      ),
    /Stopped/,
  );
  assert.ok(!h.calls.includes('personalize'));
});
test('workflow routing and resume fingerprints include the request and project inputs', () => {
  assert.equal(workflowMode({ ...project, site: null }), 'build');
  assert.equal(workflowMode(project), 'edit');
  assert.equal(workflowMode(project, { mode: 'clone' }), 'clone');
  assert.throws(() => workflowMode(project, { mode: 'invalid' }));
  assert.throws(() =>
    workflowMode({ ...project, site: null }, { mode: 'edit' }),
  );
  const body = { mode: 'build', prompt: 'Business' },
    key = workflowFingerprint(project, body);
  for (const changed of [
    { ...project, revision: 4 },
    { ...project, reference: { previewUrl: 'https://other.framer.website/' } },
    { ...project, assets: [{ id: 'image', url: 'https://example.com/image' }] },
  ])
    assert.notEqual(key, workflowFingerprint(changed, body));
  assert.notEqual(
    key,
    workflowFingerprint(project, { ...body, prompt: 'Changed' }),
  );
});
test('chat observes each saved checkpoint and keeps worker progress after reconnecting', async () => {
  const originalFetch = globalThis.fetch,
    originalStorage = globalThis.localStorage,
    originalTimer = globalThis.setTimeout;
  globalThis.localStorage = { getItem: () => 'a'.repeat(64) };
  let poll = 0;
  const checkpoints = [];
  globalThis.setTimeout = (fn, _ms, ...args) => originalTimer(fn, 0, ...args);
  globalThis.fetch = async (url) =>
    new Response(
      JSON.stringify(
        String(url).includes('reconstruction-job')
          ? {
              status: ++poll === 3 ? 'completed' : 'running',
              stage: 'Checking website',
              checkpointAt: poll,
              events: [],
              steps: ['editing', 'checking'],
            }
          : poll === 3
            ? { site: { title: 'Ready' } }
            : {
                generation: {
                  completed: poll,
                  draftSite: { title: 'Draft ' + poll },
                },
              },
      ),
    );
  try {
    const result = await watchReconstruction(
      'project',
      'job',
      () => {},
      new AbortController().signal,
      { onCheckpoint: (c) => checkpoints.push(c.completed) },
    );
    assert.equal(result.site.title, 'Ready');
    assert.deepEqual(checkpoints, [1, 2]);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalStorage;
    globalThis.setTimeout = originalTimer;
  }
});

test('durable jobs deduplicate identical requests and reject competing prompts', async () => {
  const { mkdtemp, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { createHash, randomUUID } = await import('node:crypto');
  const { saveJob, startJob } =
    await import('../server/reconstruction/jobs.js');
  const previousRoot = process.env.FUSION_JOB_DIR;
  const root = await mkdtemp(tmpdir() + '/fusion-workflow-lock-');
  process.env.FUSION_JOB_DIR = root;
  const p = { ...project, id: 'project', versions: [] },
    body = { mode: 'build', prompt: 'Gym', requestId: 'request' },
    owner = 'owner',
    id = randomUUID();
  try {
    await saveJob({
      id,
      owner,
      project: p.id,
      status: 'running',
      pid: process.pid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fingerprint: workflowFingerprint(p, body),
    });
    await writeFile(
      root +
        '/' +
        createHash('sha256')
          .update(owner + p.id)
          .digest('hex') +
        '.lock',
      id,
    );
    let quotaCalls = 0;
    const job = await startJob(owner, p, body, {
      beforeStart: () => quotaCalls++,
    });
    assert.equal(job.id, id);
    assert.equal(quotaCalls, 0);
    await assert.rejects(
      () => startJob(owner, p, { ...body, prompt: 'Different request' }),
      /Another request/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
    if (previousRoot === undefined) delete process.env.FUSION_JOB_DIR;
    else process.env.FUSION_JOB_DIR = previousRoot;
  }
});
test('resume copies owned matching checkpoints and does not charge a fresh generation', async () => {
  const { mkdtemp, writeFile, readFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { randomUUID } = await import('node:crypto');
  const { saveJob, startJob, jobPath } =
    await import('../server/reconstruction/jobs.js');
  const previousRoot = process.env.FUSION_JOB_DIR;
  const root = await mkdtemp(tmpdir() + '/fusion-workflow-resume-');
  process.env.FUSION_JOB_DIR = root;
  const id = randomUUID(),
    owner = 'owner',
    p = { ...project, id: 'project', versions: [], generation: { jobId: id } },
    body = { mode: 'build', prompt: 'Gym', requestId: 'request' };
  try {
    await saveJob({
      id,
      owner,
      project: p.id,
      status: 'failed',
      fingerprint: workflowFingerprint(p, body),
    });
    await writeFile(
      jobPath(id) + '/workflow.json',
      JSON.stringify({ state: { comparison: { passed: true } } }),
    );
    let resumed;
    await assert.rejects(
      () =>
        startJob(owner, p, body, {
          beforeStart: ({ resuming }) => {
            resumed = resuming;
            throw Error('Test stops before launching a worker');
          },
        }),
      /Test stops/,
    );
    assert.equal(resumed, true);
    const dirs = await (await import('node:fs/promises')).readdir(root);
    const copied = dirs.find((n) => n !== id && /^[a-f0-9-]{36}$/.test(n));
    assert.equal(
      JSON.parse(await readFile(jobPath(copied) + '/workflow.json')).state
        .comparison.passed,
      true,
    );
    await assert.rejects(
      () =>
        startJob(
          owner,
          p,
          { ...body, prompt: 'New request' },
          {
            beforeStart: ({ resuming }) => {
              resumed = resuming;
              throw Error('Test stops');
            },
          },
        ),
      /Test stops/,
    );
    assert.equal(resumed, false);
  } finally {
    await rm(root, { recursive: true, force: true });
    if (previousRoot === undefined) delete process.env.FUSION_JOB_DIR;
    else process.env.FUSION_JOB_DIR = previousRoot;
  }
});
