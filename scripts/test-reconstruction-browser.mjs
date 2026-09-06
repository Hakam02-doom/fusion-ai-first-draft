import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openBrowser } from '../server/reconstruction/session.js';
import { assembleCapture } from '../server/reconstruction/assemble.js';
import { siteDocument } from '../shared/site.js';

test(
  'separate opacity and transform animations keep scrolled sections visible, including reduced motion',
  { timeout: 30000 },
  async () => {
    const session = await openBrowser();
    try {
      const motions = ['opacity', 'transform'].map((property) => ({
        target: '2',
        keyframes:
          property === 'opacity'
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [{ transform: 'translateY(20px)' }, { transform: 'none' }],
        timing: { duration: 40, iterations: 1, fill: 'both' },
      }));
      const site = assembleCapture({
        interactions: [],
        viewports: [
          {
            width: 1440,
            initial: { animations: motions },
            measured: { animations: motions },
            document: {
              title: 'Animation regression',
              description: '',
              html: '<h1>Gym</h1><div style="height:1400px"></div><section data-fusion-node="2" style="opacity:0;transform:translateY(20px);height:150px"><h2>Training</h2></section>',
              css: 'body{margin:0}section{background:orange}',
            },
          },
        ],
      });
      for (const reducedMotion of ['no-preference', 'reduce']) {
        const page = await session.browser.newPage({
          viewport: { width: 1440, height: 1000 },
          reducedMotion,
        });
        await page.setContent(siteDocument(site));
        await page.locator('section').scrollIntoViewIfNeeded();
        await page.waitForFunction(
          () =>
            getComputedStyle(document.querySelector('section')).opacity === '1',
        );
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(100);
        const style = await page
          .locator('section')
          .evaluate((n) => ({
            opacity: getComputedStyle(n).opacity,
            transform: getComputedStyle(n).transform,
          }));
        assert.equal(style.opacity, '1');
        assert.ok(
          ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(style.transform),
        );
        assert.equal(
          await page.evaluate(() => document.getAnimations().length),
          2,
          'both animation properties survive; repeated snapshots are deduplicated',
        );
        await page.close();
      }
    } finally {
      await session.close();
    }
  },
);
