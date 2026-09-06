import { createHash } from 'node:crypto';
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  unlink,
  readdir,
} from 'node:fs/promises';
import path from 'node:path';
import { get, put, del, list } from '@vercel/blob';
const dataRoot = () =>
  path.resolve(process.env.FUSION_DATA_DIR || '.fusion-data');
export const cloudStorage = () =>
  !['local', 'worker'].includes(process.env.FUSION_STORAGE_BACKEND) &&
  Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export function ownerFrom(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
  if (!/^[a-f0-9]{64}$/.test(token))
    throw Object.assign(new Error('Open your workspace to continue.'), {
      status: 401,
    });
  return createHash('sha256').update(token).digest('hex');
}
export async function read(key) {
  if (cloudStorage()) {
    const result = await get(key, { access: 'private', useCache: false });
    if (!result) return null;
    return JSON.parse(await new Response(result.stream).text());
  }
  if (process.env.VERCEL)
    throw Object.assign(new Error('Cloud storage is not connected.'), {
      status: 503,
    });
  try {
    return JSON.parse(await readFile(path.join(dataRoot(), key), 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}
export async function write(key, value, { exclusive = false } = {}) {
  if (cloudStorage())
    return put(key, JSON.stringify(value), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: !exclusive,
      contentType: 'application/json',
      cacheControlMaxAge: 0,
    });
  if (process.env.VERCEL)
    throw Object.assign(new Error('Cloud storage is not connected.'), {
      status: 503,
    });
  const file = path.join(dataRoot(), key);
  await mkdir(path.dirname(file), { recursive: true });
  if (exclusive) return writeFile(file, JSON.stringify(value), { flag: 'wx' });
  const tmp = file + '.' + crypto.randomUUID();
  await writeFile(tmp, JSON.stringify(value));
  await rename(tmp, file);
}
export async function remove(key) {
  if (cloudStorage()) return del(key);
  await unlink(path.join(dataRoot(), key)).catch((e) => {
    if (e.code !== 'ENOENT') throw e;
  });
}
export async function keys(prefix) {
  if (cloudStorage()) {
    let cursor;
    const result = [];
    do {
      const page = await list({ prefix, limit: 100, cursor });
      result.push(...page.blobs.map((b) => b.pathname));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return result;
  }
  try {
    return (await readdir(path.join(dataRoot(), prefix)))
      .filter((n) => n.endsWith('.json'))
      .map((n) => prefix + n);
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}
export const projectKey = (owner, id) =>
  `workspaces/${owner}/projects/${id}.json`;
