import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const workerActions = new Map([
  ['status', 'GET'],
  ['reconstruct', 'POST'],
  ['reconstruction-job', 'GET'],
  ['reconstruction-cancel', 'POST'],
  ['reconstruction-artifact', 'GET'],
]);
// The local testing profile keeps the entire workspace on the worker's disk.
// The default hosted profile still shares Blob storage with its gateway.
const workspaceActions = new Map([
  ...workerActions,
  ['asset', 'GET'],
  ['public', 'GET'],
  ['projects', 'GET'],
  ['project', 'GET'],
  ...[
    'create',
    'import',
    'discover',
    'select',
    'restore',
    'rename',
    'duplicate',
    'delete',
    'upload',
    'share',
    'unpublish',
    'export',
  ].map((action) => [action, 'POST']),
]);
export const remoteStorage = () =>
  remoteWorker() && process.env.FUSION_STORAGE_BACKEND === 'worker';
export const supportedWorkerActions = () =>
  ['worker', 'local'].includes(process.env.FUSION_STORAGE_BACKEND)
    ? workspaceActions
    : workerActions;
export const remoteWorker = () =>
  !process.env.FUSION_WORKER_PROCESS && Boolean(process.env.FUSION_WORKER_URL);
export function workerSecret() {
  const secret = process.env.FUSION_WORKER_SECRET || '';
  if (secret.length < 32)
    throw Error('Configure a worker secret of at least 32 characters.');
  return secret;
}
function signature(
  secret,
  { method, path, authorization = '', timestamp, nonce, body = '' },
) {
  return createHmac('sha256', secret)
    .update([method, path, authorization, timestamp, nonce, body].join('\n'))
    .digest('hex');
}
export function signedHeaders(secret, request) {
  const timestamp = String(Date.now());
  const nonce = randomUUID();
  return {
    authorization: request.authorization || '',
    'content-type': 'application/json',
    'x-fusion-time': timestamp,
    'x-fusion-nonce': nonce,
    'x-fusion-signature': signature(secret, { ...request, timestamp, nonce }),
  };
}
export function requestVerifier(secret) {
  const used = new Map();
  return (req, body) => {
    const timestamp = req.headers['x-fusion-time'];
    const nonce = req.headers['x-fusion-nonce'];
    const supplied = req.headers['x-fusion-signature'] || '';
    const now = Date.now();
    for (const [key, expiry] of used) if (expiry <= now) used.delete(key);
    if (
      !/^\d{13}$/.test(timestamp || '') ||
      Math.abs(now - Number(timestamp)) > 60000 ||
      !/^[a-f0-9-]{36}$/.test(nonce || '') ||
      !/^[a-f0-9]{64}$/.test(supplied) ||
      used.has(nonce)
    )
      throw Object.assign(Error('Unauthorized worker request.'), {
        status: 401,
      });
    const expected = signature(secret, {
      method: req.method,
      path: req.url,
      authorization: req.headers.authorization,
      timestamp,
      nonce,
      body,
    });
    if (
      !timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(supplied, 'hex'),
      )
    )
      throw Object.assign(Error('Unauthorized worker request.'), {
        status: 401,
      });
    if (used.size >= 10000)
      throw Object.assign(Error('Worker request capacity reached.'), {
        status: 429,
      });
    used.set(nonce, now + 120000);
  };
}
export async function workerRequest(
  action,
  { method = 'GET', authorization = '', body, params = {} } = {},
) {
  const base = new URL(process.env.FUSION_WORKER_URL);
  if (
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== '/' ||
    (base.protocol !== 'https:' &&
      !(
        base.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)
      ))
  )
    throw Error(
      'FUSION_WORKER_URL must be an HTTPS origin (HTTP is allowed on localhost).',
    );
  if (supportedWorkerActions().get(action) !== method)
    throw Error('Unsupported worker operation.');
  const url = new URL('/api/builder', base);
  url.search = new URLSearchParams({ action, ...params });
  const serialized = body === undefined ? '' : JSON.stringify(body);
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: signedHeaders(workerSecret(), {
        method,
        path: url.pathname + url.search,
        authorization,
        body: serialized,
      }),
      ...(method === 'POST' ? { body: serialized || undefined } : {}),
      redirect: 'error',
      signal: AbortSignal.timeout(
        ['reconstruct', 'discover'].includes(action) ? 90000 : 30000,
      ),
    });
  } catch {
    throw Object.assign(
      Error(
        'The browser worker is unavailable. Your saved work is safe; try again shortly.',
      ),
      { status: 503 },
    );
  }
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw Object.assign(
      Error(
        result.error || 'The browser worker could not complete this request.',
      ),
      { status: response.status },
    );
  }
  return response;
}
