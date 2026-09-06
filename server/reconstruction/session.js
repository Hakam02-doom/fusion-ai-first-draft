import { chromium } from 'playwright-core';
import hostedChromium from '@sparticuz/chromium';
import { allowedPreview, allowedResource } from '../browser.js';
export function browserProvider() {
  return (
    process.env.FUSION_BROWSER_PROVIDER ||
    (process.env.BROWSERBASE_API_KEY ? 'browserbase' : 'local')
  );
}
async function browserbase(path, body) {
  const response = await fetch(`https://api.browserbase.com/v1${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'X-BB-API-Key': process.env.BROWSERBASE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw Error(
      `Cloud browser request failed (${response.status}). Check the Browserbase account configuration.`,
    );
  return response.json();
}
export async function openBrowser({ onSession = () => {}, signal } = {}) {
  signal?.throwIfAborted();
  let browser, session;
  const provider = browserProvider();
  if (provider === 'browserbase') {
    if (!process.env.BROWSERBASE_API_KEY)
      throw Error('Configure BROWSERBASE_API_KEY to use the cloud browser.');
    session = await browserbase('/sessions', {
      ...(process.env.BROWSERBASE_PROJECT_ID
        ? { projectId: process.env.BROWSERBASE_PROJECT_ID }
        : {}),
      timeout: 1800,
      browserSettings: {
        viewport: { width: 1440, height: 1000 },
        recordSession: true,
        logSession: true,
      },
    });
    try {
      browser = await chromium.connectOverCDP(session.connectUrl);
    } catch {
      await browserbase(`/sessions/${session.id}`, {
        status: 'REQUEST_RELEASE',
        projectId: session.projectId,
      }).catch(() => {});
      throw Error('Could not connect to the cloud browser. Retry the job.');
    }
    const debug = await browserbase(`/sessions/${session.id}/debug`).catch(
      () => null,
    );
    await onSession({
      provider,
      id: session.id,
      liveUrl: debug?.debuggerFullscreenUrl || null,
    });
  } else if (provider === 'local') {
    browser = await chromium.launch(
      process.env.FUSION_CHROMIUM_EXECUTABLE_PATH
        ? {
            executablePath: process.env.FUSION_CHROMIUM_EXECUTABLE_PATH,
            headless: true,
            chromiumSandbox: process.env.FUSION_CHROMIUM_SANDBOX !== 'false',
            args: ['--disable-dev-shm-usage'],
          }
        : process.platform === 'darwin'
          ? {
              executablePath:
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
              headless: true,
            }
          : {
              args: hostedChromium.args,
              executablePath: await hostedChromium.executablePath(),
              headless: true,
            },
    );
    await onSession({ provider, liveUrl: null });
  } else
    throw Error('Unsupported browser provider. Choose local or browserbase.');
  let closed = false;
  const close = async () => {
    if (closed) return;
    closed = true;
    await browser.close().catch(() => {});
    if (session)
      await browserbase(`/sessions/${session.id}`, {
        status: 'REQUEST_RELEASE',
        projectId: session.projectId,
      }).catch(() => {});
  };
  signal?.addEventListener('abort', close, { once: true });
  return {
    browser,
    provider,
    close: async () => {
      signal?.removeEventListener('abort', close);
      await close();
    },
  };
}
export async function referenceContext(browser, referenceUrl) {
  if (!allowedPreview(referenceUrl))
    throw Error(
      'Reference capture currently supports public Framer-hosted sites.',
    );
  const origin = new URL(referenceUrl).origin;
  const context =
    browser.contexts()[0] ||
    (await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
      serviceWorkers: 'block',
    }));
  const blocked = new Set();
  await context.route('**/*', (route) => {
    const url = route.request().url();
    const permitted =
      allowedResource(url) &&
      (route.request().isNavigationRequest()
        ? new URL(url).origin === origin
        : true);
    if (!permitted) blocked.add(url);
    return permitted ? route.continue() : route.abort();
  });
  return { context, blocked };
}
