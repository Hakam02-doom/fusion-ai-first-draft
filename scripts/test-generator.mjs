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
import { reactArchive } from '../server/export.js';
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
