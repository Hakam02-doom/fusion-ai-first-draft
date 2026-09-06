import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { unzipSync, strFromU8 } from 'fflate';
import { parse as parseJS } from '@babel/parser';
import { validateSite } from '../server/generate.js';
import {
  listingLinks,
  parseListing,
  rankCandidates,
  categoryFor,
} from '../server/marketplace.js';
import { allowedPreview, allowedResource } from '../server/browser.js';
import { siteDocument } from '../shared/site.js';
import { runInNewContext } from 'node:vm';
import { reactArchive, exportInteractions } from '../server/export.js';
const fixture = {
  title: 'Test Studio',
  description: 'A test design',
  html: '<header><nav><a href="#work">Work</a></nav></header><main><h1>A place for considered design</h1><section id="work"><h2>Selected work</h2><p>Our work connects material and light.</p></section></main>',
  css: 'body{margin:0;font-family:serif;background:#f4efe7;color:#25241f}main,header{padding:24px}h1{font-size:clamp(32px,5vw,72px)}',
  js: '',
  reply: 'Created the website.',
};
test('discovery deduplicates listing links and resolves the visible preview', () => {
  const items = listingLinks(
    '<a href="/marketplace/templates/test/"><img alt="Test" src="https://example.com/x.png"></a><a href="/marketplace/templates/test/">Test</a><a href="/marketplace/templates/categories/designers/">Designers</a>',
  );
  assert.equal(items.length, 1);
  assert.equal(items[0].name, 'Test');
  const r = parseListing(
    '<h1>Test</h1><a href="https://test.framer.website/">Show Preview</a><p>Single-Use</p>',
    'https://www.framer.com/marketplace/templates/test/',
  );
  assert.equal(r.previewUrl, 'https://test.framer.website/');
  assert.equal(r.license, 'Single-use');
});
test('matching is relevant, deterministic and limited to a shortlist', () => {
  const items = [
    { name: 'Studio', description: 'warm architecture', listingUrl: 'a' },
    { name: 'Analytics', description: 'software', listingUrl: 'b' },
    { name: 'House', description: 'architecture', listingUrl: 'c' },
    { name: 'Blog', description: 'news', listingUrl: 'd' },
  ];
  assert.equal(categoryFor('warm architecture studio'), 'architecture');
  assert.deepEqual(
    rankCandidates(items, 'warm architecture', 'seed'),
    rankCandidates(items, 'warm architecture', 'seed'),
  );
  assert.equal(
    rankCandidates(items, 'warm architecture', 'seed')[0].name,
    'Studio',
  );
  assert.equal(rankCandidates(items, 'x', 'seed').length, 3);
});
test('inspection rejects private hosts, credentials and lookalike preview hosts', () => {
  for (const url of [
    'http://localhost:3000',
    'https://127.0.0.1',
    'https://test.framer.website.attacker.com',
    'https://user:pass@test.framer.website',
    'https://test.framer.website:444',
  ])
    assert.equal(allowedPreview(url), false);
  assert.equal(allowedPreview('https://test.framer.website/'), true);
  assert.equal(allowedResource('http://169.254.169.254'), false);
});
test('generated code is validated and isolated with a restrictive CSP', () => {
  const site = validateSite({
    ...fixture,
    html:
      fixture.html +
      '<script>alert(1)</script><img src="x" onerror="alert(1)"><iframe src="https://evil.test"></iframe>',
  });
  assert.ok(!site.html.includes('<script'));
  assert.ok(!site.html.includes('onerror'));
  assert.ok(!site.html.includes('iframe'));
  const doc = siteDocument(site);
  assert.ok(doc.includes('connect-src &#39;none&#39;'));
  assert.ok(doc.includes('nonce="fusion-preview"'));
  assert.throws(() => validateSite({ ...fixture, js: 'const = nope' }));
});
test('React export contains editable, parseable JSX and working source files', () => {
  const files = unzipSync(reactArchive(fixture));
  for (const name of [
    'src/App.jsx',
    'src/site.css',
    'src/interactions.js',
    'standalone.html',
    'package.json',
  ])
    assert.ok(files[name]);
  const jsx = strFromU8(files['src/App.jsx']);
  assert.ok(!jsx.includes('dangerouslySetInnerHTML'));
  parseJS(jsx, { sourceType: 'module', plugins: ['jsx'] });
  parseJS(strFromU8(files['src/interactions.js']), { sourceType: 'module' });
});
let server, origin, storage, handler, root;
before(async () => {
  root = await mkdtemp(tmpdir() + '/fusion-test-');
  process.env.FUSION_DATA_DIR = root;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.VERCEL;
  storage = await import('../server/storage.js');
  handler = (await import('../api/builder.js')).default;
  server = createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(root, { recursive: true, force: true });
});
const key = 'a'.repeat(64),
  other = 'b'.repeat(64);
async function call(action, body, token = key, extra = '') {
  const r = await fetch(`${origin}/?action=${action}${extra}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    r,
    data: r.headers.get('content-type')?.includes('zip')
      ? new Uint8Array(await r.arrayBuffer())
      : await r.json(),
  };
}
test('cloud API ownership, versions, share snapshot, revoke and soft delete', async () => {
  const { data: p } = await call('create', {
    prompt: 'Create an architecture website',
  });
  assert.ok(p.id);
  assert.equal(
    (await call('project', null, other, `&id=${p.id}`)).r.status,
    404,
  );
  assert.equal((await call('projects', null, 'invalid')).r.status, 401);
  assert.equal((await call('create', { prompt: '' })).r.status, 400);
  const owner = createHash('sha256').update(key).digest('hex');
  const site = validateSite(fixture);
  await storage.write(storage.projectKey(owner, p.id), {
    ...p,
    site,
    versions: [
      { id: 'one', site, prompt: 'first' },
      { id: 'two', site: { ...site, title: 'Updated' }, prompt: 'second' },
    ],
    activeVersion: 1,
  });
  assert.equal(
    (await call('restore', { id: p.id, index: 0 })).data.site.title,
    'Test Studio',
  );
  const share = (await call('share', { id: p.id })).data;
  assert.ok(share.shareId);
  const pub = await call('public', null, '', `&id=${share.shareId}`);
  assert.equal(pub.data.site.title, 'Test Studio');
  assert.ok(!pub.data.messages);
  const exp = await call('export', { id: p.id });
  assert.equal(exp.r.status, 200);
  assert.ok(unzipSync(exp.data)['src/App.jsx']);
  await call('unpublish', { id: p.id });
  assert.equal(
    (await call('public', null, '', `&id=${share.shareId}`)).r.status,
    404,
  );
  await call('delete', { id: p.id });
  assert.equal((await call('projects')).data.projects.length, 0);
});
test('generation streams progress, validates in a browser, saves once and preserves a version on provider failure', async () => {
  const { data: p } = await call('create', {
    prompt: 'Create an architecture studio website',
  });
  const owner = createHash('sha256').update(key).digest('hex');
  await storage.write(storage.projectKey(owner, p.id), {
    ...p,
    site: fixture,
    reference: {
      name: 'Original studio reference',
      previewUrl: 'https://test.framer.website/',
      description: 'Editorial studio',
    },
    versions: [{ id: 'base', site: fixture, prompt: 'Original' }],
    activeVersion: 0,
  });
  const realFetch = globalThis.fetch;
  process.env.FUSION_AI_PROVIDER = 'vercel';
  process.env.AI_GATEWAY_API_KEY = 'test-only-provider-key';
  globalThis.fetch = (url, options) =>
    String(url).startsWith('https://ai-gateway.vercel.sh/')
      ? Promise.resolve(
          Response.json({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    ...fixture,
                    title: 'Updated Studio',
                  }),
                },
              },
            ],
          }),
        )
      : realFetch(url, options);
  try {
    const request = {
      id: p.id,
      prompt: 'Change the website name to Updated Studio',
      requestId: 'test-request',
    };
    const r = await realFetch(origin + '/?action=generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    const events = (await r.text()).trim().split('\n').map(JSON.parse);
    assert.ok(events.some((e) => e.stage?.includes('Checking desktop')));
    const result = events.find((e) => e.result)?.result;
    assert.ok(result, JSON.stringify(events));
    assert.equal(result.versions.length, 2);
    assert.equal(result.site.title, 'Updated Studio');
    assert.equal((await call('generate', request)).data.versions.length, 2);
    globalThis.fetch = (url, options) =>
      String(url).startsWith('https://ai-gateway.vercel.sh/')
        ? Promise.resolve(
            Response.json(
              { error: { message: 'credit card required' } },
              { status: 403 },
            ),
          )
        : realFetch(url, options);
    const failed = await realFetch(origin + '/?action=generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, requestId: 'failed-request' }),
    });
    assert.match(await failed.text(), /billing enabled/);
    assert.equal(
      (await call('project', null, key, `&id=${p.id}`)).data.versions.length,
      2,
    );
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.FUSION_AI_PROVIDER;
  }
});

test('Export preserves hidden navigation and initializes scripts after DOM readiness', () => {
  const files = unzipSync(
    reactArchive({ ...fixture, html: fixture.html + '<nav hidden>Menu</nav>' }),
  );
  assert.match(strFromU8(files['src/App.jsx']), /hidden=\{true\}/);
  assert.match(strFromU8(files['src/site.css']), /display:none!important/);
  for (const readyState of ['loading', 'complete']) {
    let calls = 0,
      pending;
    const document = {
      readyState,
      addEventListener(type, listener) {
        assert.equal(type, 'DOMContentLoaded');
        pending = listener;
      },
    };
    runInNewContext(
      exportInteractions(
        "document.addEventListener('DOMContentLoaded', function(){ start(); });",
      ),
      {
        document,
        Event,
        start() {
          calls++;
        },
      },
    );
    if (readyState === 'loading') {
      assert.equal(calls, 0);
      pending();
    }
    assert.equal(calls, 1);
  }
});

test('Staged Kimi generation saves each step, resumes after failure, and commits one validated version', async () => {
  const { data: p } = await call('create', {
    prompt: 'A compact analytics website',
  });
  const owner = createHash('sha256').update(key).digest('hex');
  const pk = storage.projectKey(owner, p.id);
  const reference = {
    name: 'Analytics reference',
    previewUrl: 'https://test.framer.website/',
    description: 'Analytics',
  };
  await storage.write(pk, { ...p, reference });
  await storage.write(
    `inspections/${createHash('sha256').update(reference.previewUrl).digest('hex')}.json`,
    {
      timestamp: Date.now(),
      available: true,
      evidence: { fonts: ['Reference Serif'], colors: ['rgb(20, 20, 20)'] },
      images: [],
    },
  );
  const layout = {
    title: 'Orbit',
    description: 'Analytics',
    headline: 'Understand your business',
    intro: 'Practical analytics for teams.',
    background: '#101010',
    foreground: '#eeeeee',
    accent: '#ff7733',
    font: 'Inter',
    html: '<header>Orbit</header><main><section id="home"><h1>Understand your business</h1><p>Practical analytics for teams.</p></section><div id="fusion-sections"></div></main><footer>Orbit</footer>',
    css: 'body{margin:0;font-family:sans-serif}section,header,footer{padding:20px;max-width:100%}*{box-sizing:border-box}',
    sections: [
      { id: 'features', title: 'Features', purpose: 'Capabilities' },
      { id: 'workflow', title: 'Workflow', purpose: 'Process' },
      { id: 'contact', title: 'Contact', purpose: 'Get started' },
    ],
  };
  const previousEnv = Object.fromEntries(
    ['FUSION_AI_PROVIDER', 'FUSION_MODEL', 'NVIDIA_API_KEY'].map((n) => [
      n,
      process.env[n],
    ]),
  );
  process.env.FUSION_AI_PROVIDER = 'nvidia';
  process.env.FUSION_MODEL = 'moonshotai/kimi-k3';
  process.env.NVIDIA_API_KEY = 'test';
  const realFetch = globalThis.fetch;
  const calls = [];
  let failSection = true;
  globalThis.fetch = async (url, options) => {
    if (!String(url).startsWith('https://integrate.api.nvidia.com/'))
      return realFetch(url, options);
    const payload = JSON.parse(options.body);
    const task = JSON.parse(payload.messages[1].content[0].text);
    calls.push(task.step);
    assert.match(
      payload.messages[0].content,
      /DESIGN POLICY impeccable-4.1.1-fusion-v1/,
    );
    assert.deepEqual(task.designContext.fonts, ['Reference Serif']);
    assert.ok(
      !payload.messages[0].content.includes('Reference Serif'),
      'reference evidence stays out of system instructions',
    );
    if (task.step === 'section-1' && failSection) {
      failSection = false;
      throw new DOMException('Delayed provider', 'TimeoutError');
    }
    const value =
      task.step === 'layout'
        ? layout
        : task.step.startsWith('section')
          ? {
              html: `<section id="${task.section.id}"><h2>${task.section.title}</h2><p>Helpful information for teams.</p></section>`,
            }
          : task.step === 'styles'
            ? { css: 'h2{font-size:clamp(22px,3vw,36px)}' }
            : { js: '' };
    return Response.json({
      choices: [
        { message: { content: JSON.stringify(value) }, finish_reason: 'stop' },
      ],
    });
  };
  const invoke = async () => {
    const r = await realFetch(origin + '/?action=generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: p.id,
        prompt: p.prompt,
        requestId: 'staged-request',
      }),
    });
    return (await r.text()).trim().split('\n').map(JSON.parse);
  };
  try {
    const quotaBefore = (
      await storage.keys(
        `usage/${new Date().toISOString().slice(0, 10)}/${owner}/`,
      )
    ).length;
    let events = await invoke();
    assert.ok(events.some((e) => e.continuation));
    let saved = await storage.read(pk);
    assert.equal(saved.generation.completed, 1);
    assert.equal(
      saved.generation.designPolicyVersion,
      'impeccable-4.1.1-fusion-v1',
    );
    assert.deepEqual(saved.generation.designContext.fonts, ['Reference Serif']);
    assert.equal(saved.site, null);
    assert.equal(saved.versions.length, 0);
    assert.match(saved.generation.draftSite.html, /<h1/);
    events = await invoke();
    assert.ok(events.some((e) => e.error));
    saved = await storage.read(pk);
    assert.equal(
      saved.generation.completed,
      1,
      'failed section must retain the completed layout',
    );
    for (let i = 0; i < 5; i++) events = await invoke();
    assert.ok(
      events.some((e) => e.result),
      JSON.stringify(events),
    );
    saved = await storage.read(pk);
    assert.equal(saved.generation, null);
    assert.equal(saved.versions.length, 1);
    assert.equal(saved.validation.passed, true);
    assert.equal(
      calls.filter((s) => s === 'layout').length,
      1,
      'resume must not regenerate completed layout',
    );
    assert.equal(calls.filter((s) => s === 'section-1').length, 2);
    const quotaAfter = (
      await storage.keys(
        `usage/${new Date().toISOString().slice(0, 10)}/${owner}/`,
      )
    ).length;
    assert.equal(
      quotaAfter - quotaBefore,
      1,
      'continuations are one logical generation',
    );
    const count = calls.length;
    await invoke();
    assert.equal(calls.length, count, 'completed request IDs are idempotent');
  } finally {
    globalThis.fetch = realFetch;
    for (const [name, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test('Saved generation steps are invalidated by prompt, reference, assets or revision changes', async () => {
  const { stagedFingerprint, canResumeGeneration } =
    await import('../server/staged-generation.js');
  const p = {
    revision: 1,
    assets: [],
    reference: { previewUrl: 'https://one.framer.website/' },
  };
  const body = { prompt: 'Build a studio' };
  p.generation = { fingerprint: stagedFingerprint(p, body) };
  assert.equal(canResumeGeneration(p, body), true);
  for (const changed of [
    { ...p, revision: 2 },
    { ...p, assets: [{ id: 'new' }] },
    { ...p, reference: { previewUrl: 'https://two.framer.website/' } },
  ])
    assert.equal(canResumeGeneration(changed, body), false);
  assert.equal(canResumeGeneration(p, { prompt: 'Build a cafe' }), false);
});

test('Compact edit patches preserve unrelated files and reject ambiguous replacements', async () => {
  const { applySitePatch } = await import('../server/generate.js');
  const changed = applySitePatch(fixture, {
    changes: [
      {
        file: 'html',
        find: 'A place for considered design',
        replace: 'A calmer place',
      },
    ],
    reply: 'Changed heading',
  });
  assert.equal(changed.css, fixture.css);
  assert.equal(changed.js, fixture.js);
  assert.match(changed.html, /A calmer place/);
  assert.throws(
    () =>
      applySitePatch(fixture, {
        changes: [{ file: 'html', find: '>', replace: 'x' }],
        reply: 'No',
      }),
    /could not be applied safely/,
  );
  assert.match(fixture.html, /A place for considered design/);
});

test('Chat continues saved steps with the same request ID and stops between requests when cancelled', async () => {
  const { generate } = await import('../src/components/builder/client.js');
  const originalFetch = globalThis.fetch,
    originalStorage = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => 'a'.repeat(64) };
  const requests = [],
    checkpoints = [];
  globalThis.fetch = async (url, options) => {
    requests.push(JSON.parse(options.body));
    const events =
      requests.length === 1
        ? [
            { checkpoint: { completed: 1, total: 6, draftSite: fixture } },
            { continuation: true },
          ]
        : [{ result: { site: fixture } }];
    if (requests.length === 2)
      assert.equal(
        checkpoints.length,
        1,
        'show saved preview before continuing',
      );
    return new Response(
      events.map((e) => JSON.stringify(e)).join('\n') + '\n',
      { headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  };
  try {
    const result = await generate('test', 'Build', () => {}, undefined, {
      onCheckpoint: (c) => checkpoints.push(c),
    });
    assert.equal(result.site.title, fixture.title);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].requestId, requests[1].requestId);
    requests.length = 0;
    const abort = new AbortController();
    await assert.rejects(
      generate('test', 'Build', () => {}, abort.signal, {
        onCheckpoint: () => abort.abort(),
      }),
      (e) => e.name === 'AbortError',
    );
    assert.equal(requests.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalStorage;
  }
});

test('visual draft upgrades preserve saved sections, styling, and resume identity', async () => {
  const { refreshGenerationDraft } =
    await import('../server/staged-generation.js');
  const layout = {
    title: 'Orbit Analytics',
    description: 'Analytics for teams',
    headline: 'See your data clearly.',
    intro: 'Make informed decisions.',
    background: '#f9f9f9',
    foreground: '#181818',
    accent: '#0000ee',
    font: 'Inter',
    html: '<main><h1>Old draft</h1><div id="fusion-sections"></div></main>',
    css: 'body{margin:0}',
    sections: [
      { id: 'features', title: 'Everything you need', purpose: 'Capabilities' },
      { id: 'workflow', title: 'How it works', purpose: 'Process' },
      { id: 'impact', title: 'Impact', purpose: 'Benefits' },
    ],
  };
  const sections = [
    '<section id="features"><h2>Saved features</h2></section>',
    '<section id="workflow"><h2>Saved workflow</h2><img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" alt="Team"></section>',
  ];
  const project = {
    site: fixture,
    generation: {
      layout,
      sections,
      completed: 3,
      fingerprint: 'resume-identity',
      css: layout.css + '\n.custom{color:red}',
      js: 'document.body.dataset.saved="yes";',
      prompt: 'Create an analytics website',
      redesign: false,
    },
  };
  const before = structuredClone(project);
  const upgraded = refreshGenerationDraft(project);
  assert.deepEqual(
    project,
    before,
    'reading a draft must not mutate stored data',
  );
  assert.equal(upgraded.site, fixture, 'validated version remains unchanged');
  assert.equal(upgraded.generation.completed, 3);
  assert.equal(upgraded.generation.fingerprint, 'resume-identity');
  assert.deepEqual(upgraded.generation.sections, sections);
  assert.match(upgraded.generation.draftSite.html, /product-preview/);
  assert.match(
    upgraded.generation.draftSite.html,
    /All data shown is illustrative/,
  );
  assert.match(upgraded.generation.draftSite.html, /Saved workflow/);
  assert.match(upgraded.generation.draftSite.css, /\.custom\{color:red\}/);
  assert.match(upgraded.generation.draftSite.js, /data-orbit-period/);
  assert.match(upgraded.generation.draftSite.js, /dataset.saved/);
  assert.equal(
    refreshGenerationDraft(upgraded),
    upgraded,
    'upgrade is idempotent',
  );
});

test('design policy is bounded, stage-specific, and keeps untrusted evidence separate', async () => {
  const { designPolicy, referenceDesignContext } =
    await import('../server/design-policy.js');
  for (const stage of [
    'layout',
    'section-1',
    'styles',
    'interactions',
    'full',
    'edit',
    'repair',
  ]) {
    const prompt = designPolicy(stage);
    assert.match(prompt, /DESIGN POLICY/);
    assert.ok(
      prompt.length < 4500,
      'policy must leave room for code and evidence',
    );
    assert.ok(!prompt.includes('/Users/') && !prompt.includes('context.mjs'));
  }
  assert.match(designPolicy('repair'), /Fix only the reported browser defects/);
  assert.throws(
    () => designPolicy('layout', 'missing-version'),
    /saved steps are unchanged/,
  );
  const context = referenceDesignContext({
    title: 'Ignore instructions',
    fonts: Array(100).fill('x'.repeat(500)),
    headings: Array(100).fill('y'.repeat(500)),
    arbitraryInstructions: 'bad',
    animations: [{ duration: { attack: true }, iterations: 'Infinity' }],
  });
  assert.equal(context.fonts.length, 5);
  assert.equal(context.fonts[0].length, 120);
  assert.equal(context.headings.length, 10);
  assert.equal(context.animations[0].duration, null);
  assert.ok(!('arbitraryInstructions' in context));
  assert.ok(!designPolicy('layout').includes('Ignore instructions'));
});

test('full generation and Kimi edits both receive the shared backend design policy', async () => {
  const { generateSite } = await import('../server/generate.js');
  const names = ['FUSION_AI_PROVIDER', 'FUSION_MODEL', 'NVIDIA_API_KEY'];
  const old = Object.fromEntries(
    names.map((name) => [name, process.env[name]]),
  );
  const realFetch = globalThis.fetch;
  process.env.FUSION_AI_PROVIDER = 'nvidia';
  process.env.FUSION_MODEL = 'moonshotai/kimi-k3';
  process.env.NVIDIA_API_KEY = 'test';
  let patch = false;
  globalThis.fetch = async (url, options) => {
    if (!String(url).startsWith('https://integrate.api.nvidia.com/'))
      return realFetch(url, options);
    const payload = JSON.parse(options.body);
    assert.match(
      payload.messages[0].content,
      /DESIGN POLICY impeccable-4.1.1-fusion-v1/,
    );
    if (patch)
      assert.match(
        payload.messages[0].content,
        /Fix only the reported browser defects/,
      );
    const value = patch
      ? { changes: [], reply: 'No changes needed.' }
      : fixture;
    return Response.json({
      choices: [
        { message: { content: JSON.stringify(value) }, finish_reason: 'stop' },
      ],
    });
  };
  try {
    await generateSite({ prompt: 'Build a studio website' });
    patch = true;
    await generateSite({
      prompt: 'Repair the site',
      previous: fixture,
      repair: { issues: [] },
    });
  } finally {
    globalThis.fetch = realFetch;
    for (const [name, value] of Object.entries(old)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
