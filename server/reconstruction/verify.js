import { openBrowser } from './session.js';
import { allowedResource } from '../browser.js';
import { siteDocument } from '../../shared/site.js';
import { settlePage } from './capture.js';

export function invalidContactLinks(hrefs) {
  return [...new Set(hrefs)].filter((href) => {
    if (/^mailto:/i.test(href))
      return !/^mailto:[^?\s@]+@[^?\s@]+\.[^?\s@]+(?:\?.*)?$/i.test(href);
    if (/^tel:/i.test(href)) return !/^tel:[+\d().\s-]{5,}$/i.test(href);
    return false;
  });
}

export async function verifyReconstruction(
  site,
  { assets = [], signal, onEvent = () => {} } = {},
) {
  const session = await openBrowser({ signal });
  try {
    const context = await session.browser.newContext({
      deviceScaleFactor: 1,
      serviceWorkers: 'block',
    });
    await context.route('**/*', (route) => {
      const asset = assets.find((a) => a.url === route.request().url());
      if (asset?.data) {
        const [, contentType, body] = asset.data.match(
          /^data:([^;]+);base64,(.+)$/,
        );
        return route.fulfill({
          contentType,
          body: Buffer.from(body, 'base64'),
        });
      }
      return allowedResource(route.request().url())
        ? route.continue()
        : route.abort();
    });
    const errors = [],
      checks = [];
    let thumbnail;
    for (const width of [1440, 768, 390]) {
      signal?.throwIfAborted();
      await onEvent({ stage: `Checking your updated website at ${width}px` });
      const page = await context.newPage();
      page.on('pageerror', (e) => errors.push(e.message.slice(0, 250)));
      await page.setViewportSize({ width, height: 1000 });
      await page.setContent(siteDocument(site), {
        waitUntil: 'domcontentloaded',
        timeout: 25000,
      });
      await settlePage(page, signal);
      const { contactLinks, ...check } = await page.evaluate(() => ({
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
        headings: document.querySelectorAll('h1,h2').length,
        missingImages: [...document.images].filter(
          (i) => !i.complete || !i.naturalWidth,
        ).length,
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')]
          .map((a) => a.getAttribute('href').slice(1))
          .filter((id) => id && !document.getElementById(id)),
        contactLinks: [
          ...document.querySelectorAll('a[href^="mailto:"],a[href^="tel:"]'),
        ].map((a) => a.getAttribute('href')),
      }));
      checks.push({
        ...check,
        invalidLinks: invalidContactLinks(contactLinks),
      });
      if (width === 1440)
        thumbnail =
          'data:image/jpeg;base64,' +
          (await page.screenshot({ type: 'jpeg', quality: 55 })).toString(
            'base64',
          );
      await page.close();
    }
    return {
      passed:
        !errors.length &&
        checks.every(
          (c) =>
            !c.overflow &&
            c.headings > 0 &&
            !c.missingImages &&
            !c.invalidLinks.length &&
            !c.brokenAnchors.length,
        ),
      checks,
      errors,
      thumbnail,
    };
  } finally {
    await session.close();
  }
}
