import { z } from 'zod';
import { parseFragment, serializeOuter } from 'parse5';
import { modelJSON } from '../model.js';
import { validateSite } from '../generate.js';
import { designPolicy } from '../design-policy.js';
import { openBrowser, referenceContext } from './session.js';
import { measurePage } from './dom.js';
import { isInspectableControl } from './controls.js';
import {
  patchContent,
  patchWordmark,
  patchInteractionContent,
} from './content-patch.js';
const contract = z.object({
  changes: z
    .array(
      z.object({
        width: z.number().int().optional(),
        file: z.enum(['html', 'css', 'js']),
        scope: z.enum(['source', 'text', 'link']).default('source'),
        find: z.string().min(1).max(10000),
        replace: z.string().max(16000),
        all: z.boolean().optional(),
      }),
    )
    .max(100),
  wordmarks: z
    .array(
      z.object({
        width: z.union([z.literal(1440), z.literal(768), z.literal(390)]),
        id: z.string().regex(/^\d+$/),
        text: z.string().min(1).max(50),
        fontFamily: z
          .string()
          .max(120)
          .regex(/^[\w\s,'"-]+$/)
          .optional(),
        fontSize: z
          .preprocess(
            (value) =>
              typeof value === 'string' &&
              /^\d+(?:\.\d+)?(?:px)?$/.test(value.trim())
                ? parseFloat(value)
                : value,
            z.number().min(12).max(60),
          )
          .optional(),
        color: z
          .string()
          .max(40)
          .regex(
            /^(#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})|[a-z]+|rgba?\(\s*\d+(?:\.\d+)?%?(?:\s*,\s*\d+(?:\.\d+)?%?){2}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\))$/i,
          )
          .optional(),
      }),
    )
    .max(12)
    .default([]),
  reply: z.string().max(1500),
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(400).optional(),
});
export function applyCapturedPatch(previous, input) {
  const patch = contract.parse(input),
    next = structuredClone(previous);
  const changes = patch.changes.filter(
    (change) => change.find !== change.replace,
  );
  let applied = 0;
  for (const change of changes) {
    let hits = 0;
    for (const variant of next.variants) {
      if (change.width && variant.width !== change.width) continue;
      if (change.scope !== 'source') {
        if (change.file !== 'html')
          throw Error('Copy and link edits must target HTML.');
        const result = patchContent(variant.html, change);
        if (result.hits > 1 && !change.all)
          throw Error(
            'The reconstruction edit is ambiguous; saved content is unchanged.',
          );
        const nextJS = patchInteractionContent(variant.js, [change]);
        const stateChanged = nextJS !== variant.js;
        if (!result.hits && stateChanged && !change.all)
          throw Error('A repeated interaction-state edit requires all:true.');
        variant.html = result.html;
        variant.js = nextJS;
        hits += result.hits || Number(stateChanged);
        continue;
      }
      const text = variant[change.file],
        count = text.split(change.find).length - 1;
      if (!count) continue;
      if (count > 1 && !change.all)
        throw Error(
          'The reconstruction edit is ambiguous; saved content is unchanged.',
        );
      variant[change.file] = change.all
        ? text.replaceAll(change.find, change.replace)
        : text.replace(change.find, change.replace);
      hits += count;
    }
    if (!hits)
      throw Error(
        'The requested reconstruction edit does not match captured code.',
      );
    applied += hits;
  }
  for (const mark of patch.wordmarks) {
    const variant = next.variants.find((v) => v.width === mark.width);
    if (!variant) throw Error('The wordmark viewport was not captured.');
    const result = patchWordmark(variant.html, mark);
    if (result.hits !== 1)
      throw Error('The selected logo was not found uniquely.');
    variant.html = result.html;
    variant.js = patchInteractionContent(variant.js, [], [mark]);
    applied += result.hits;
  }
  if (!applied && changes.length)
    throw Error('No reconstruction changes could be applied.');
  Object.assign(next, {
    html: next.variants[0].html,
    css: next.variants[0].css,
    js: next.variants[0].js,
    reply: patch.reply,
    ...(patch.title ? { title: patch.title } : {}),
    ...(patch.description !== undefined
      ? { description: patch.description }
      : {}),
  });
  return validateSite(next);
}
export function personalizationEvidence(site) {
  const text = new Set(),
    images = new Map(),
    links = new Map(),
    logos = [];
  function walk(n, width, isLogo = false, region = 'content', media = true) {
    const attrs = Object.fromEntries(
      (n.attrs || []).map((a) => [a.name, a.value]),
    );
    isLogo ||= /^logo\s*$/i.test(attrs['data-framer-name'] || '');
    if (['header', 'nav', 'footer'].includes(n.tagName)) region = n.tagName;
    if (n.nodeName === '#text' && n.value.trim().length > 2)
      text.add(serializeOuter(n));
    if (n.tagName === 'a' && attrs.href)
      links.set(attrs.href, {
        href: attrs.href,
        label: serializeOuter(n)
          .replace(/<[^>]+>/g, '')
          .slice(0, 150),
      });
    if (n.tagName === 'img' && media) {
      if (attrs.src)
        images.set(attrs.src, { src: attrs.src, alt: attrs.alt || '' });
      if (isLogo || /\blogo\b/i.test(attrs.alt || ''))
        logos.push({
          width,
          region,
          id: attrs['data-fusion-node'],
          src: attrs.src,
          alt: attrs.alt || '',
          markup: serializeOuter(n),
        });
    }
    n.childNodes?.forEach((child) => walk(child, width, isLogo, region, media));
  }
  site.variants.forEach((v) => {
    walk(parseFragment(v.html), v.width);
    const runtime = v.js.match(/const data=(.*?);const controller=/s);
    if (runtime) {
      const data = JSON.parse(runtime[1]);
      for (const action of data.actions || [])
        for (const patch of action.patches || [])
          for (const key of ['before', 'after'])
            if (typeof patch[key] === 'string')
              walk(
                parseFragment(patch[key]),
                v.width,
                false,
                'interaction',
                false,
              );
    }
  });
  return {
    title: site.title,
    description: site.description,
    copy: [...text].slice(0, 220),
    images: [...images.values()].slice(0, 40),
    links: [...links.values()].slice(0, 80),
    logos: logos
      .sort(
        (a, b) =>
          Number(a.region === 'content') - Number(b.region === 'content'),
      )
      .slice(0, 18),
  };
}
export function sectionEvidence(html, terms) {
  const result = [];
  const words = terms
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3)
    .slice(0, 20);
  function walk(n) {
    if (n.tagName) {
      const text = serializeOuter(n);
      if (
        text.length < 9000 &&
        (n.tagName.match(/^h[1-3]$/) ||
          words.some((w) => text.toLowerCase().includes(w)))
      ) {
        result.push(text);
        return;
      }
    }
    n.childNodes?.forEach(walk);
  }
  walk(parseFragment(html));
  return result.join('\n').slice(0, 14000) || html.slice(0, 6000);
}
export function resolveInspectionNode(measured, request) {
  return request.target
    ? [...measured.elements, ...measured.sections, ...measured.controls].find(
        (node) => node.id === request.target,
      )
    : measured.sections.find(
        (node) => node.id === request.section || node.name === request.section,
      );
}
const system =
  designPolicy('repair') +
  `\nYou are reconstructing captured frontend code. The captured reference is the visual authority. Do not substitute stock components, remove sections, invent copy or simplify the visual design. Return ONLY {changes:[{width?,file,find,replace,all?}],reply}; files are html, css, js. Each find is an exact unique substring; all:true is only for intentional repeated changes such as a user-requested brand rename. Omit width to apply to each matching breakpoint. Keep replacements compact. If more reference evidence is needed, return {inspect:{action,section?,target?,width?}} instead. Allowed actions: inspect_section, inspect_control, scroll_to, hover, click. Only use target IDs or section IDs supplied in evidence. Never return executable browser code. Do not claim visual validation.`;
export async function editCapturedSite({
  previous,
  prompt,
  repair,
  reference,
  inspection,
  assets = [],
  personalize = false,
  signal,
  onProgress,
  callModel = modelJSON,
}) {
  const task = {
    brief: prompt,
    repair,
    reference,
    observations: inspection?.evidence,
    assets: assets.map(({ data: _data, ...asset }) => asset),
    capturedContent: personalizationEvidence(previous),
    variants: previous.variants.map((v) => ({
      width: v.width,
      html: sectionEvidence(
        v.html,
        prompt + ' ' + JSON.stringify(repair || ''),
      ),
      css: v.css.slice(0, 10000),
    })),
  };
  let session, context, page;
  try {
    for (let turn = 0; turn < 3; turn++) {
      signal?.throwIfAborted();
      const response = await callModel({
        system:
          system +
          '\nFor copy edits use {file:"html",scope:"text",find,replace,all:true}; this changes text nodes and saved interaction states without corrupting links or image URLs. For destinations use scope:"link" with an exact href from capturedContent.links. Use scope:"source" only for deliberate code changes. To replace a brand logo image with a visible text wordmark, return wordmarks:[{width,id,text,fontFamily?,fontSize?,color?}] using capturedContent.logos IDs at EVERY breakpoint; retain the existing logo box. Do not merely rename an image alt attribute when its pixels show the old brand. Return changes:[] alongside wordmarks when no other changes are needed. Never relabel a checkout link as a trial while keeping the old payment destination; use an existing relevant section anchor when no booking URL is provided. Replace unsupported contact links with the contact section anchor and clear their new-window target if necessary. Keep creator/license attribution separate from the client brand.' +
          (repair
            ? ''
            : '\nThis is a user edit; follow the requested change and preserve unrelated content.') +
          (personalize
            ? '\nAdapt the captured website to the business and requirements in the brief. Preserve section structure, responsive geometry, visual components and motion. Rewrite existing copy slots and brand names to fit the brief; typography and imagery may change when requested. Use supplied image URLs for requested replacements and preserve their aspect ratios. Never invent image URLs, claims, testimonials, prices or company facts. Reference numbers and testimonials are illustrative placeholders unless supplied by the user; label them accordingly when adapting a business. Return optional title and description matching the new business. capturedContent.copy contains exact HTML-escaped source substrings; replace each intended repeated substring with all:true across every breakpoint. Keep replacement lengths close to the reference to preserve layout. Respect explicit requests to keep content unchanged. Do not leave the original brand in interactive state snapshots when renaming it; use targeted js data replacements as needed.'
            : ''),
        prompt: JSON.stringify(task),
        maxTokens: personalize ? 7000 : 5000,
        signal,
        onProgress,
      });
      if (!response.inspect) {
        try {
          return applyCapturedPatch(previous, response);
        } catch (error) {
          if (turn === 2)
            throw Error(
              'The model could not produce a valid edit. Your saved website is unchanged; try a narrower request.',
            );
          task.patchCorrection = {
            error: error.message,
            previousPatch: response,
            instruction:
              'Return a corrected complete patch against the original captured site. None of the rejected patch was applied. Use exact evidence values and valid field types.',
          };
          onProgress?.({ stage: 'Correcting the website edit format' });
          continue;
        }
      }
      if (turn === 2)
        throw Error(
          'Inspection budget reached. Captured output is unchanged; narrow the requested edit.',
        );
      const parsedRequest = z
        .object({
          action: z.enum([
            'inspect_section',
            'inspect_control',
            'scroll_to',
            'hover',
            'click',
          ]),
          target: z.string().regex(/^\d+$/).optional(),
          section: z.string().max(120).optional(),
          width: z
            .union([z.literal(1440), z.literal(768), z.literal(390)])
            .default(1440),
        })
        .safeParse(response.inspect);
      if (!parsedRequest.success) {
        task.inspectionCorrection = {
          error:
            'Use a supported action, numeric target ID, and a captured viewport (1440, 768 or 390).',
          previousRequest: response.inspect,
        };
        onProgress?.({ stage: 'Correcting the reference inspection request' });
        continue;
      }
      const request = parsedRequest.data;
      if (!reference?.previewUrl)
        throw Error('The reference browser is unavailable for this edit.');
      if (!session) {
        session = await openBrowser({ signal });
        ({ context } = await referenceContext(
          session.browser,
          reference.previewUrl,
        ));
        page = await context.newPage();
      }
      await page.setViewportSize({ width: request.width, height: 1000 });
      await page.goto(reference.previewUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      const measured = await page.evaluate(measurePage);
      const node = resolveInspectionNode(measured, request);
      if (!node) {
        task.inspectionCorrection = {
          error:
            'The requested element is absent. Choose an exact section name or node ID below, or return a patch using the captured source.',
          previousRequest: request,
          sections: measured.sections.map(({ id, name, heading }) => ({
            id,
            name,
            heading,
          })),
          controls: measured.controls.map(({ id, name, text }) => ({
            id,
            name,
            text,
          })),
        };
        onProgress?.({
          stage: 'Matching the inspection request to captured sections',
        });
        continue;
      }
      const target = page.locator(`[data-fusion-node="${node.id}"]`);
      if (
        request.action === 'scroll_to' ||
        request.action === 'inspect_section'
      )
        await target.scrollIntoViewIfNeeded();
      if (request.action === 'hover') await target.hover();
      if (request.action === 'click') {
        const facts = await target.evaluate((n) => ({
          kind: 'click',
          text: n.textContent,
          inForm: !!n.closest('form'),
          isLink: !!n.closest('a'),
          disclosure:
            n.tagName === 'SUMMARY' ||
            n.hasAttribute('aria-expanded') ||
            !!n.closest('[id*="faq" i],[data-framer-name*="faq" i]'),
        }));
        if (!isInspectableControl(facts))
          throw Error('That reference action is outside frontend inspection.');
        await target.click();
      }
      await page.waitForTimeout(500);
      const after = await page.evaluate(measurePage);
      task.browserEvidence = {
        action: request,
        measurement: [...after.elements, ...after.controls].filter(
          (e) => e.id === node.id,
        ),
        html: (await target.evaluate((n) => n.outerHTML)).slice(0, 18000),
      };
      onProgress?.({
        stage: `Inspected reference: ${request.action.replaceAll('_', ' ')}`,
      });
    }
  } finally {
    await session?.close();
  }
}
