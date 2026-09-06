import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { CAPTURE_VERSION } from './capture.js';
const directory = (url) =>
  path.resolve(
    process.env.FUSION_JOB_DIR || '.fusion-jobs',
    'cache',
    createHash('sha256')
      .update(CAPTURE_VERSION + url)
      .digest('hex'),
  );
export async function cachedCapture(url, jobDir) {
  try {
    const dir = directory(url),
      capture = JSON.parse(
        await readFile(path.join(dir, 'capture.json'), 'utf8'),
      );
    if (Date.now() - capture.createdAt > 86400000) return null;
    await Promise.all(
      capture.viewports.map((v) =>
        copyFile(path.join(dir, v.screenshot), path.join(jobDir, v.screenshot)),
      ),
    );
    return capture;
  } catch {
    return null;
  }
}
export async function cacheCapture(capture, jobDir) {
  const dir = directory(capture.url);
  await mkdir(dir, { recursive: true });
  await Promise.all(
    capture.viewports.map((v) =>
      copyFile(path.join(jobDir, v.screenshot), path.join(dir, v.screenshot)),
    ),
  );
  await writeFile(path.join(dir, 'capture.json'), JSON.stringify(capture));
}
