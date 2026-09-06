import { chromium as playwright } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { siteDocument } from '../shared/site.js';
export function allowedPreview(url) {
  try {
    const u = new URL(url);
    return (
      u.protocol === 'https:' &&
      !u.username &&
      !u.password &&
      !u.port &&
      ['.framer.website', '.framer.app', '.framer.ai'].some((s) =>
        u.hostname.endsWith(s),
      )
    );
  } catch {
    return false;
  }
}
export function allowedResource(url) {
  try {
    const u = new URL(url);
    return (
      u.protocol === 'https:' &&
      ([
        'framerusercontent.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'images.unsplash.com',
        'framer.com',
        'www.framer.com',
        'fusion-ai-first-draft.vercel.app',
      ].includes(u.hostname) ||
        allowedPreview(url) ||
        u.hostname.endsWith('.public.blob.vercel-storage.com'))
    );
  } catch {
    return false;
  }
}
async function launch() {
  return playwright.launch(
    process.platform === 'darwin'
      ? {
          executablePath:
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          headless: true,
        }
      : {
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        },
  );
}
async function context(browser, assets = []) {
  const c = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
    acceptDownloads: false,
  });
  await c.route('**/*', (route) => {
    const asset = assets.find((a) => a.url === route.request().url());
    if (asset?.data) {
      const match = asset.data.match(/^data:([^;]+);base64,(.+)$/);
      return route.fulfill({
        contentType: match[1],
        body: Buffer.from(match[2], 'base64'),
      });
    }
    return allowedResource(route.request().url())
      ? route.continue()
      : route.abort();
  });
  return c;
}
export async function inspectPreview(reference) {
  if (!allowedPreview(reference.previewUrl))
    return {
      available: false,
      reason:
        'This creator hosts its preview on a custom domain. Open the reference manually; automated inspection currently supports Framer-hosted previews.',
    };
  const browser = await launch();
  try {
    const c = await context(browser);
    const page = await c.newPage();
    await page.goto(reference.previewUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    });
    await page.waitForTimeout(1200);
    const desktop = await page.screenshot({ type: 'jpeg', quality: 65 });
    const evidence = await page.evaluate(() => ({
      title: document.title,
      headings: [...document.querySelectorAll('h1,h2,h3')]
        .slice(0, 24)
        .map((n) => n.textContent.trim()),
      fonts: [
        ...new Set(
          [...document.querySelectorAll('h1,h2,p')]
            .slice(0, 30)
            .map((n) => getComputedStyle(n).fontFamily),
        ),
      ],
      colors: [
        ...new Set(
          [...document.querySelectorAll('body,section,h1,h2,a')]
            .slice(0, 40)
            .flatMap((n) => [
              getComputedStyle(n).color,
              getComputedStyle(n).backgroundColor,
            ]),
        ),
      ].slice(0, 16),
      links: [...document.querySelectorAll('a[href]')]
        .slice(0, 30)
        .map((n) => ({
          text: n.textContent.trim().slice(0, 80),
          href: n.getAttribute('href'),
        })),
      animations: document
        .getAnimations()
        .slice(0, 20)
        .map((a) => ({
          duration: a.effect?.getTiming().duration,
          iterations: String(a.effect?.getTiming().iterations),
        })),
    }));
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(600);
    const middle = await page.screenshot({ type: 'jpeg', quality: 60 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const mobile = await page.screenshot({ type: 'jpeg', quality: 60 });
    return {
      available: true,
      evidence,
      images: [desktop, middle, mobile].map(
        (b) => 'data:image/jpeg;base64,' + b.toString('base64'),
      ),
      inspectedAt: new Date().toISOString(),
    };
  } finally {
    await browser.close();
  }
}
export async function inspectGenerated(site, assets = []) {
  const browser = await launch();
  try {
    const c = await context(browser, assets);
    const page = await c.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
    await page.setContent(siteDocument(site), {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });
    await page.waitForTimeout(800);
    const checks = [];
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      checks.push(
        await page.evaluate(() => ({
          width: innerWidth,
          overflow: document.documentElement.scrollWidth > innerWidth + 2,
          h1: document.querySelectorAll('h1').length,
          brokenAnchors: [...document.querySelectorAll('a[href^="#"]')]
            .map((n) => n.getAttribute('href').slice(1))
            .filter((id) => id && !document.getElementById(id)),
          missingImages: [...document.images].filter(
            (i) => i.complete && i.naturalWidth === 0,
          ).length,
        })),
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    const thumbnail =
      'data:image/jpeg;base64,' +
      (await page.screenshot({ type: 'jpeg', quality: 60 })).toString('base64');
    return {
      checks,
      errors,
      thumbnail,
      passed:
        !errors.length &&
        checks.every(
          (c) =>
            !c.overflow &&
            c.h1 === 1 &&
            !c.brokenAnchors.length &&
            !c.missingImages,
        ),
    };
  } finally {
    await browser.close();
  }
}
