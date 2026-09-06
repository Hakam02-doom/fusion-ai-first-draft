import { openBrowser, referenceContext } from './session.js';
import { measurePage, serializePage } from './dom.js';
import { isInspectableControl } from './controls.js';
export const CAPTURE_VERSION = 4;
// Normalize animation clocks for comparison without changing captured motion data.
export async function freezeComparisonMotion(page) {
  await page.evaluate(async () => {
    await Promise.all(
      document.getAnimations().map(async (animation) => {
        if (animation.id === 'fusion-scroll') return;
        try {
          if (animation.effect.getTiming().iterations === Infinity) {
            animation.pause();
            await animation.ready;
            animation.currentTime = 0;
          } else {
            await animation.ready;
            animation.finish();
          }
        } catch {}
      }),
    );
  });
}
export async function settlePage(page, signal, track = false) {
  await page.evaluate(() => document.fonts.ready);
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  if (height > 35000)
    throw Error(
      'Reference exceeds the current capture limit of 35,000 pixels.',
    );
  const samples = [];
  for (let y = 0; y < height; y += 650) {
    signal?.throwIfAborted();
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(180);
    if (track)
      samples.push(
        await page.evaluate(() => {
          const animated = new Set(
            document.getAnimations().map((a) => a.effect?.target),
          );
          return {
            y: scrollY,
            nodes: [...document.querySelectorAll('[data-fusion-node][style]')]
              .filter(
                (n) =>
                  !animated.has(n) &&
                  (n.style.transform || n.style.opacity || n.style.filter),
              )
              .map((n) => ({
                id: n.dataset.fusionNode,
                transform: getComputedStyle(n).transform,
                opacity: getComputedStyle(n).opacity,
                filter: getComputedStyle(n).filter,
              })),
          };
        }),
      );
  }
  await page.waitForTimeout(1300);
  await page.evaluate(() => {
    scrollTo(0, 0);
    document.querySelectorAll('img').forEach((i) => (i.loading = 'eager'));
  });
  await page.waitForTimeout(800);
  return samples;
}
export async function captureReference(
  reference,
  { signal, onEvent = () => {}, onArtifact = () => {} } = {},
) {
  const session = await openBrowser({
    signal,
    onSession: (info) =>
      onEvent({ stage: 'Browser session ready', browser: info }),
  });
  try {
    const { context, blocked } = await referenceContext(
      session.browser,
      reference.previewUrl,
    );
    const page = await context.newPage();
    const capture = {
      version: CAPTURE_VERSION,
      url: reference.previewUrl,
      createdAt: Date.now(),
      provider: session.provider,
      viewports: [],
      interactions: [],
      warnings: [],
    };
    for (const width of [1440, 768, 390]) {
      signal?.throwIfAborted();
      await onEvent({ stage: `Inspecting reference at ${width}px` });
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(reference.previewUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });
      await page.waitForTimeout(1500);
      const initial = await page.evaluate(measurePage);
      const scrollSamples = await settlePage(page, signal, true);
      const measured = await page.evaluate(measurePage);
      const document = await page.evaluate(serializePage);
      if (document.html.length > 2500000 || document.css.length > 2000000)
        throw Error('The reference exceeds this worker’s document limit.');
      // Freeze clocks only for the reproducible comparison, after capturing motion evidence.
      await freezeComparisonMotion(page);
      const screenshot = await page.screenshot({ fullPage: true, type: 'png' });
      const artifact = `reference-${width}.png`;
      await onArtifact(artifact, screenshot);
      capture.viewports.push({
        width,
        initial,
        scrollSamples,
        measured,
        document,
        screenshot: artifact,
      });
      {
        const candidates = await page
          .locator(
            'a[data-highlight],button,[role="button"],summary,[tabindex="0"][data-highlight]:not(a)',
          )
          .evaluateAll((nodes) =>
            nodes
              .filter((n) => {
                const r = n.getBoundingClientRect();
                return (
                  r.width > 0 &&
                  r.height > 0 &&
                  !n.parentElement.closest(
                    '[tabindex="0"][data-highlight],button,[role="button"]',
                  )
                );
              })
              .slice(0, 24)
              .map((n) => ({
                id: n.dataset.fusionNode,
                kind: n.tagName === 'A' ? 'hover' : 'click',
                inForm: !!n.closest('form'),
                isLink: !!n.closest('a'),
                disclosure:
                  n.tagName === 'SUMMARY' ||
                  n.hasAttribute('aria-expanded') ||
                  !!n.closest('[id*="faq" i],[data-framer-name*="faq" i]'),
                text: (
                  n.textContent ||
                  n.getAttribute('aria-label') ||
                  n.getAttribute('data-framer-name') ||
                  ''
                )
                  .trim()
                  .slice(0, 100),
              })),
          );
        for (const candidate of candidates) {
          signal?.throwIfAborted();
          if (!isInspectableControl(candidate)) {
            capture.warnings.push(
              `Skipped action outside frontend inspection: ${candidate.text || candidate.id} at ${width}px`,
            );
            continue;
          }
          const target = page.locator(`[data-fusion-node="${candidate.id}"]`);
          if (!(await target.isVisible())) continue;
          try {
            await target.scrollIntoViewIfNeeded();
            await page.evaluate((id) => {
              const target = document.querySelector(
                `[data-fusion-node="${id}"]`,
              );
              const snapshots = new Map(
                [...document.querySelectorAll('[data-fusion-node]')].map(
                  (n) => [n.dataset.fusionNode, { html: n.outerHTML, node: n }],
                ),
              );
              const changed = new Set();
              const observer = new MutationObserver((records) =>
                records.forEach((r) => {
                  if (
                    r.type === 'attributes' &&
                    ![
                      'class',
                      'aria-expanded',
                      'aria-selected',
                      'style',
                    ].includes(r.attributeName)
                  )
                    return;
                  if (
                    r.target === document.body ||
                    r.target === document.documentElement
                  )
                    return;
                  if (
                    r.attributeName === 'style' &&
                    !r.target.contains(target) &&
                    !target.contains(r.target)
                  )
                    return;
                  changed.add(
                    r.target.nodeType === 1 ? r.target : r.target.parentElement,
                  );
                }),
              );
              observer.observe(
                target.closest('nav,section,header,footer') || document.body,
                {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  characterData: true,
                },
              );
              window.__fusionAction = { snapshots, changed, observer, target };
            }, candidate.id);
            if (candidate.kind === 'hover')
              await target.hover({ timeout: 2000 });
            else await target.click({ timeout: 2000 });
            await page.waitForTimeout(650);
            if (
              new URL(page.url()).pathname !==
              new URL(reference.previewUrl).pathname
            )
              continue;
            const state = await page.evaluate(() => {
              const { snapshots, changed, observer, target } =
                window.__fusionAction;
              observer.disconnect();
              const nodes = [...changed].filter((n) => n.isConnected);
              if (!nodes.length) return null;
              let root = nodes[0];
              while (
                root &&
                (!nodes.every((n) => root.contains(n)) ||
                  !root.contains(target))
              )
                root = root.parentElement;
              while (root && !snapshots.has(root.dataset.fusionNode))
                root = root.parentElement;
              if (!root || root === document.body || root.offsetHeight > 1800)
                return null;
              return {
                root: root.dataset.fusionNode,
                before: snapshots.get(root.dataset.fusionNode).html,
                after: root.outerHTML,
              };
            });
            if (state && state.before !== state.after)
              capture.interactions.push({
                width,
                target: candidate,
                label: candidate.text,
                kind: candidate.kind,
                ...state,
                changed: true,
              });
            else
              capture.warnings.push(
                `No bounded state captured for ${candidate.text || candidate.id} at ${width}px`,
              );
            if (await target.count()) {
              if (candidate.kind === 'hover') await page.mouse.move(0, 0);
              else await target.click({ timeout: 1500 }).catch(() => {});
              await page.waitForTimeout(350);
            }
          } catch {
            capture.warnings.push(
              `Could not exercise ${candidate.text || candidate.id} at ${width}px`,
            );
          }
        }
      }
    }
    capture.blockedResources = [...blocked].slice(0, 80);
    await onEvent({
      stage: `Captured ${capture.viewports[0].measured.sections.length} section candidates and ${capture.interactions.length} control states`,
    });
    return capture;
  } finally {
    await session.close();
  }
}
