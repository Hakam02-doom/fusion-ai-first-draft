import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { compileAction } from '../server/reconstruction/state-diff.js';
import {
  applyCapturedPatch,
  personalizationEvidence,
  editCapturedSite,
} from '../server/reconstruction/agent.js';
import { durableModel } from '../server/reconstruction/model-cache.js';
import { isInspectableControl } from '../server/reconstruction/controls.js';
import { interactionRuntime } from '../server/reconstruction/assemble.js';
import { invalidContactLinks } from '../server/reconstruction/verify.js';
import {
  pixelDifference,
  compareHeadings,
} from '../server/reconstruction/compare.js';
import { assembleCapture } from '../server/reconstruction/assemble.js';
import { siteDocument } from '../shared/site.js';
import { parse } from '@babel/parser';
import { reactArchive } from '../server/export.js';
import { unzipSync, strFromU8 } from 'fflate';
const html =
  '<main><h1>Reference</h1><section id="work"><h2>Original section</h2><button data-fusion-node="1">Open</button><p data-fusion-node="2" hidden>Details</p></section></main>';
const css =
  'body{margin:0;font-family:sans-serif;background:white;color:black}';
const capture = {
  viewports: [1440, 768, 390].map((width) => ({
    width,
    initial: { animations: [] },
    measured: { animations: [] },
    document: {
      html,
      css,
      title: 'Reference',
      description: 'Reference description',
    },
  })),
  interactions: [],
};
test('FAQ questions containing join remain inspectable while signup and form actions do not', () => {
  assert.equal(
    isInspectableControl({
      kind: 'click',
      text: 'Can I still join FORGE?',
      disclosure: true,
    }),
    true,
  );
  assert.equal(
    isInspectableControl({ kind: 'click', text: 'Join now' }),
    false,
  );
  assert.equal(
    isInspectableControl({
      kind: 'click',
      text: 'Send message',
      inForm: true,
      disclosure: true,
    }),
    false,
  );
  assert.equal(
    isInspectableControl({
      kind: 'click',
      text: 'FAQ',
      isLink: true,
      disclosure: true,
    }),
    false,
  );
});
test('repeated reference headings are matched one-to-one by their captured nodes', () => {
  const headings = [
    { id: '1', text: '01', rect: { x: 0, y: 0, width: 100, height: 40 } },
    { id: '2', text: '01', rect: { x: 0, y: 2000, width: 100, height: 40 } },
  ];
  assert.deepEqual(
    compareHeadings(headings, headings).geometry.map((h) => h.delta),
    [0, 0],
  );
  assert.deepEqual(compareHeadings(headings, [headings[0]]).missingHeadings, [
    '01',
  ]);
});
test('captured source survives assembly without a substituted shell and each viewport is independently sanitized', () => {
  const input = structuredClone(capture);
  input.viewports[2].document.html +=
    '<script>bad()</script><img src="javascript:bad()" onerror="bad()">';
  const site = assembleCapture(input);
  assert.equal(site.variants.length, 3);
  assert.match(site.html, /Original section/);
  assert.ok(!site.html.includes('product-preview'));
  assert.ok(!site.variants[2].html.includes('<script'));
  assert.ok(!site.variants[2].html.includes('onerror'));
  const doc = siteDocument(site);
  parse(doc.match(/<script nonce="fusion-preview">([\s\S]*)<\/script>/)[1]);
  const files = unzipSync(reactArchive(site));
  for (const [name, bytes] of Object.entries(files))
    if (/\.(js|jsx)$/.test(name))
      parse(strFromU8(bytes), { sourceType: 'module', plugins: ['jsx'] });
  assert.ok(files['src/Viewport2.jsx']);
});
test('captured control changes compile into reversible patches without duplicate ancestor updates or inline handlers', () => {
  const action = compileAction({
    target: { id: '1' },
    root: '1',
    label: 'Open',
    before:
      '<div data-fusion-node="1" class="closed"><p data-fusion-node="2">Hidden</p></div>',
    after:
      '<div data-fusion-node="1" class="open" onclick="bad()"><p data-fusion-node="2">Visible</p><script>bad()</script></div>',
  });
  assert.equal(action.patches[0].attrs[0].name, 'class');
  assert.ok(JSON.stringify(action).includes('Visible'));
  assert.ok(!JSON.stringify(action).includes('onclick'));
  assert.ok(!JSON.stringify(action).includes('bad()'));
});
test('personalization patches update matching breakpoint variants atomically', () => {
  const site = assembleCapture(capture);
  const changed = applyCapturedPatch(site, {
    changes: [
      { file: 'html', find: 'Original section', replace: 'Updated section' },
    ],
    reply: 'Updated heading',
  });
  assert.ok(changed.variants.every((v) => v.html.includes('Updated section')));
  assert.ok(site.variants.every((v) => v.html.includes('Original section')));
  assert.throws(() =>
    applyCapturedPatch(site, {
      changes: [{ file: 'html', find: 'missing text', replace: 'wrong' }],
      reply: 'bad',
    }),
  );
});
test('copy and link edits remain separate and update restored interaction content', () => {
  const site = assembleCapture(capture);
  for (const variant of site.variants) {
    variant.html +=
      '<a data-fusion-node="10" href="mailto:hello@old.com">hello@old.com</a>';
    variant.js = interactionRuntime({
      motion: [],
      actions: [
        {
          patches: [
            {
              id: '11',
              attrs: [],
              before: '<p>hello@old.com</p>',
              after: '<a href="mailto:hello@old.com">hello@old.com</a>',
            },
          ],
        },
      ],
    });
  }
  const copy = applyCapturedPatch(site, {
    changes: [
      {
        file: 'html',
        scope: 'text',
        find: 'hello@old.com',
        replace: 'Book a trial',
        all: true,
      },
    ],
    reply: 'Copy updated',
  });
  assert.match(copy.html, /href="mailto:hello@old.com">Book a trial/);
  const linked = applyCapturedPatch(copy, {
    changes: [
      {
        file: 'html',
        scope: 'link',
        find: 'mailto:hello@old.com',
        replace: '#work',
        all: true,
      },
    ],
    reply: 'Destination updated',
  });
  assert.match(linked.html, /href="#work">Book a trial/);
  const state = JSON.parse(
    linked.js.match(/const data=(.*?);const controller=/s)[1],
  );
  assert.equal(
    state.actions[0].patches[0].after,
    '<a href="#work">Book a trial</a>',
  );
  assert.match(site.variants[0].html, /hello@old.com/);
});
test('wordmarks replace actual image pixels in each selected viewport and restored state', () => {
  const site = assembleCapture(capture);
  for (const variant of site.variants) {
    variant.html +=
      '<div><img data-fusion-node="10" src="https://framerusercontent.com/logo.png" alt="Old logo"></div>';
    variant.js = interactionRuntime({
      motion: [],
      actions: [
        {
          patches: [
            {
              id: '11',
              attrs: [],
              before:
                '<img data-fusion-node="10" src="https://framerusercontent.com/logo.png">',
              after:
                '<img data-fusion-node="10" src="https://framerusercontent.com/logo.png">',
            },
          ],
        },
      ],
    });
  }
  const changed = applyCapturedPatch(site, {
    changes: [],
    wordmarks: site.variants.map((v) => ({
      width: v.width,
      id: '10',
      text: 'FORGE',
      color: '#ffffff',
      fontSize: '30px',
    })),
    reply: 'Brand updated',
  });
  for (const variant of changed.variants) {
    assert.ok(!variant.html.includes('logo.png'));
    assert.match(variant.html, /data-fusion-wordmark="true"/);
    assert.match(variant.html, />FORGE<\/span>/);
    const state = JSON.parse(
      variant.js.match(/const data=(.*?);const controller=/s)[1],
    );
    assert.match(state.actions[0].patches[0].after, />FORGE<\/span>/);
  }
  assert.throws(() =>
    applyCapturedPatch(site, {
      changes: [],
      wordmarks: [{ width: 390, id: '999', text: 'FORGE' }],
      reply: 'bad',
    }),
  );
});
test('contact validation catches copy accidentally written into destinations', () => {
  assert.deepEqual(
    invalidContactLinks([
      'mailto:BOOK A TRIAL',
      'tel:Shared after booking',
      'mailto:hello@example.com',
      'tel:+1 (234) 567-8901',
    ]),
    ['mailto:BOOK A TRIAL', 'tel:Shared after booking'],
  );
});
test('copy found only in a closed interaction can be inspected and changed', () => {
  const site = assembleCapture(capture);
  for (const variant of site.variants)
    variant.js = interactionRuntime({
      motion: [],
      actions: [
        {
          patches: [
            {
              id: '2',
              attrs: [],
              before: '',
              after: '<p>Welcome to Oldbrand</p>',
            },
          ],
        },
      ],
    });
  assert.ok(personalizationEvidence(site).copy.includes('Welcome to Oldbrand'));
  const changed = applyCapturedPatch(site, {
    changes: [
      {
        file: 'html',
        scope: 'text',
        find: 'Oldbrand',
        replace: 'FORGE',
        all: true,
      },
    ],
    reply: 'Updated hidden copy',
  });
  assert.equal(changed.html, site.html);
  assert.match(changed.js, /Welcome to FORGE/);
  assert.ok(!changed.js.includes('Oldbrand'));
});
test('a rejected model patch is corrected against the unchanged captured source', async () => {
  const site = assembleCapture(capture);
  let calls = 0;
  const changed = await editCapturedSite({
    previous: site,
    prompt: 'Update the heading',
    callModel: async (request) => {
      calls++;
      if (calls === 2) assert.match(request.prompt, /patchCorrection/);
      return {
        changes: [
          {
            file: 'html',
            scope: 'text',
            find: calls === 1 ? 'Missing heading' : 'Original section',
            replace: 'Corrected heading',
            all: true,
          },
        ],
        reply: 'Updated',
      };
    },
  });
  assert.equal(calls, 2);
  assert.match(changed.html, /Corrected heading/);
  assert.match(site.html, /Original section/);
});
test('complete model responses survive validation failures without another provider call', async () => {
  const dir = await mkdtemp(tmpdir() + '/fusion-model-cache-');
  let calls = 0;
  const callModel = async () => {
    calls++;
    return { changes: [], reply: 'Cached' };
  };
  const request = { system: 'Contract', prompt: 'Build a gym', maxTokens: 100 };
  try {
    await durableModel({ dir, callModel })(request);
    const saved = await durableModel({ dir, callModel })(request);
    assert.equal(saved.reply, 'Cached');
    assert.equal(calls, 1);
    await durableModel({ dir, callModel })({
      ...request,
      prompt: 'Build a cafe',
    });
    assert.equal(calls, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('logo evidence retains header and footer branding at every width before partner logos', () => {
  const site = assembleCapture(capture);
  for (const variant of site.variants)
    variant.html +=
      '<header><div data-framer-name="Logo"><img data-fusion-node="10" src="https://framerusercontent.com/brand.png"></div></header>' +
      '<section>' +
      Array.from(
        { length: 12 },
        (_, i) =>
          `<div data-framer-name="Logo"><img data-fusion-node="${20 + i}" src="https://framerusercontent.com/partner-${i}.png"></div>`,
      ).join('') +
      '</section>' +
      '<footer><div data-framer-name="Logo"><img data-fusion-node="50" src="https://framerusercontent.com/footer.png"></div></footer>';
  const evidence = personalizationEvidence(site);
  for (const width of [1440, 768, 390]) {
    assert.ok(
      evidence.logos.some(
        (logo) => logo.width === width && logo.region === 'header',
      ),
    );
    assert.ok(
      evidence.logos.some(
        (logo) => logo.width === width && logo.region === 'footer',
      ),
    );
  }
});
test('entrance samples become one-time reveals rather than reversible scroll offsets', () => {
  const input = structuredClone(capture);
  input.viewports[0].scrollSamples = [0, 0.2, 0.8, 1, 1].map((opacity, i) => ({
    y: i * 650,
    nodes: [
      {
        id: '2',
        opacity: String(opacity),
        transform:
          opacity === 1 ? 'none' : `translateY(${20 * (1 - opacity)}px)`,
        filter: 'none',
      },
    ],
  }));
  const site = assembleCapture(input);
  const data = JSON.parse(
    site.js.match(/const data=(.*?);const controller=/s)[1],
  );
  assert.equal(data.reveals.length, 1);
  assert.equal(data.tracks.length, 0);
  assert.equal(data.reveals[0].frames.at(-1).opacity, '1');
});
test('React export retains distinct breakpoint styles and embedded image replacements', () => {
  const site = assembleCapture(capture);
  site.variants[2].css += '\nbody{background:tomato}';
  site.variants[2].html += '<img src="https://example.com/photo.png">';
  const files = unzipSync(
    reactArchive(site, [
      {
        url: 'https://example.com/photo.png',
        data: 'data:image/png;base64,YQ==',
      },
    ]),
  );
  assert.match(strFromU8(files['src/viewport-styles.js']), /tomato/);
  assert.match(
    strFromU8(files['src/Viewport2.jsx']),
    /data:image\/png;base64,YQ==/,
  );
});
test('pixel comparison distinguishes a match from a materially different or shorter page', () => {
  const a = new PNG({ width: 30, height: 30 });
  a.data.fill(255);
  const white = PNG.sync.write(a);
  assert.equal(pixelDifference(white, white).differentPixelRatio, 0);
  const b = new PNG({ width: 30, height: 30 });
  b.data.fill(0);
  assert.equal(
    pixelDifference(white, PNG.sync.write(b)).differentPixelRatio,
    1,
  );
  const short = new PNG({ width: 30, height: 15 });
  short.data.fill(255);
  assert.ok(
    pixelDifference(white, PNG.sync.write(short)).differentPixelRatio > 0.4,
  );
});
test('durable jobs enforce ownership and hide worker internals', async () => {
  const old = process.env.FUSION_JOB_DIR;
  process.env.FUSION_JOB_DIR = await mkdtemp(tmpdir() + '/fusion-jobs-test-');
  const { saveJob, readJob, publicJob, cancelJob } =
    await import('../server/reconstruction/jobs.js');
  const job = {
    id: randomUUID(),
    owner: 'owner-a',
    project: 'p',
    body: { prompt: 'private' },
    pid: 123,
    lock: '/private',
    status: 'running',
  };
  try {
    await saveJob(job);
    await assert.rejects(() => readJob(job.id, 'owner-b'), /not found/);
    const loaded = await readJob(job.id, 'owner-a');
    assert.equal(loaded.status, 'running');
    assert.ok(!('owner' in publicJob(loaded)));
    assert.ok(!('lock' in publicJob(loaded)));
    assert.ok(!('body' in publicJob(loaded)));
    await cancelJob(job.id, 'owner-a');
  } finally {
    await rm(process.env.FUSION_JOB_DIR, { recursive: true, force: true });
    if (old === undefined) delete process.env.FUSION_JOB_DIR;
    else process.env.FUSION_JOB_DIR = old;
  }
});
