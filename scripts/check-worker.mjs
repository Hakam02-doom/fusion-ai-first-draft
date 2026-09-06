import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { workerSecret } from '../server/worker/transport.js';
import { atomicWrite } from '../server/worker/atomic.js';
import { jobRoot } from '../server/reconstruction/jobs.js';
import { openBrowser } from '../server/reconstruction/session.js';
import { read, write, remove, cloudStorage } from '../server/storage.js';
import { aiConfigured, modelConfig } from '../server/model.js';
workerSecret();
if (!(await aiConfigured()))
  throw Error('The selected model is not configured.');
if (
  process.env.NODE_ENV === 'production' &&
  (!cloudStorage() || !process.env.FUSION_JOB_DIR)
)
  throw Error(
    'Production needs private Blob storage and a persistent job volume.',
  );
await mkdir(jobRoot(), { recursive: true });
const file = path.join(jobRoot(), `check-${randomUUID()}.tmp`);
await atomicWrite(file, 'ok');
await unlink(file);
const key = `worker-health/${randomUUID()}.json`;
try {
  await write(key, { ready: true });
  if (!(await read(key))?.ready) throw Error('Shared storage read failed.');
} finally {
  await remove(key);
}
const session = await openBrowser();
try {
  const page = await session.browser.newPage();
  await page.setContent('<h1>Worker browser ready</h1>');
  await page.screenshot();
} finally {
  await session.close();
}
console.log(
  JSON.stringify({
    workerSecret: 'configured',
    storage: cloudStorage() ? 'cloud' : 'local-test',
    volume: 'writable',
    browser: 'passed',
    model: modelConfig().model,
    modelCredentials: 'configured (provider request not made)',
  }),
);
