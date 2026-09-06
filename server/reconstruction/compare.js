import { PNG } from 'pngjs';
import { openBrowser } from './session.js';
import { allowedResource } from '../browser.js';
import { siteDocument } from '../../shared/site.js';
import { measurePage } from './dom.js';
import { settlePage } from './capture.js';
export function compareHeadings(reference, actual) {
  const used = new Set(),
    missingHeadings = [];
  const geometry = reference.map((h) => {
    let index = actual.findIndex(
      (m, i) => !used.has(i) && h.id && m.id === h.id && m.text === h.text,
    );
    if (index < 0)
      index =
        actual
          .map((m, i) => ({ m, i }))
          .filter(({ m, i }) => !used.has(i) && m.text === h.text)
          .sort(
            (a, b) =>
              Math.abs(a.m.rect.y - h.rect.y) - Math.abs(b.m.rect.y - h.rect.y),
          )[0]?.i ?? -1;
    if (index < 0) {
      missingHeadings.push(h.text);
      return { text: h.text, delta: null };
    }
    used.add(index);
    return {
      text: h.text,
      delta: Math.max(
        ...['x', 'y', 'width', 'height'].map((k) =>
          Math.abs(h.rect[k] - actual[index].rect[k]),
        ),
      ),
    };
  });
  return { missingHeadings, geometry };
}
export function pixelDifference(reference, actual) {
  const a = PNG.sync.read(reference),
    b = PNG.sync.read(actual);
  const width = Math.max(a.width, b.width),
    height = Math.max(a.height, b.height);
  let changed = 0,
    total = 0,
    sum = 0;
  // Uniform sampling bounds CPU even for long pages; no regions are silently masked.
  for (let y = 0; y < height; y += 3)
    for (let x = 0; x < width; x += 3) {
      total++;
      if (x >= a.width || x >= b.width || y >= a.height || y >= b.height) {
        changed++;
        sum += 255;
        continue;
      }
      const ai = (y * a.width + x) * 4,
        bi = (y * b.width + x) * 4;
      const delta = Math.max(
        ...[0, 1, 2].map((c) => Math.abs(a.data[ai + c] - b.data[bi + c])),
      );
      sum += delta;
      if (delta > 30) changed++;
    }
  return {
    differentPixelRatio: changed / total,
    meanChannelDifference: sum / total,
    referenceSize: [a.width, a.height],
    actualSize: [b.width, b.height],
  };
}
export async function compareCapture(
  capture,
  site,
  { signal, onEvent = () => {}, readArtifact, onArtifact = () => {} } = {},
) {
  const session = await openBrowser({ signal });
  try {
    const context = await session.browser.newContext({
      deviceScaleFactor: 1,
      serviceWorkers: 'block',
    });
    await context.route('**/*', (route) =>
      allowedResource(route.request().url()) ? route.continue() : route.abort(),
    );
    const errors = [];
    const checks = [];
    for (const reference of capture.viewports) {
      const page = await context.newPage();
      page.on('pageerror', (e) => errors.push(e.message.slice(0, 250)));
      signal?.throwIfAborted();
      await onEvent({
        stage: `Comparing reconstruction at ${reference.width}px`,
      });
      await page.setViewportSize({ width: reference.width, height: 1000 });
      await page.setContent(siteDocument(site), {
        waitUntil: 'domcontentloaded',
        timeout: 25000,
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(2000);
      await settlePage(page, signal);
      await page.evaluate(() =>
        document.getAnimations().forEach((a) => {
          try {
            if (a.id === 'fusion-scroll') return;
            a.pause();
            if (a.effect.getTiming().iterations === Infinity) a.currentTime = 0;
            else a.finish();
          } catch {}
        }),
      );
      const measured = await page.evaluate(measurePage);
      const integrity = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
        missingImages: [...document.images].filter(
          (i) => i.complete && i.naturalWidth === 0,
        ).length,
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')]
          .map((a) => a.getAttribute('href').slice(1))
          .filter((id) => id && !document.getElementById(id)),
      }));
      const image = await page.screenshot({ type: 'png', fullPage: true });
      const name = `generated-${reference.width}.png`;
      await onArtifact(name, image);
      const visual = pixelDifference(
        await readArtifact(reference.screenshot),
        image,
      );
      const { missingHeadings, geometry } = compareHeadings(
        reference.measured.headings,
        measured.headings,
      );
      checks.push({
        width: reference.width,
        ...integrity,
        visual,
        missingHeadings,
        geometry,
        screenshot: name,
      });
      await page.close();
    }
    const passed =
      !errors.length &&
      checks.every(
        (c) =>
          !c.overflow &&
          !c.missingImages &&
          !c.brokenAnchors.length &&
          !c.missingHeadings.length &&
          c.visual.differentPixelRatio <= 0.08 &&
          c.geometry.every((g) => g.delta !== null && g.delta <= 12),
      );
    return {
      passed,
      checks,
      errors,
      criteria: { maxDifferentPixelRatio: 0.08, maxHeadingGeometryDelta: 12 },
      status: passed ? 'matched' : 'needs-correction',
    };
  } finally {
    await session.close();
  }
}
