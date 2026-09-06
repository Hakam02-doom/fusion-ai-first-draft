import { createServer } from 'node:http';
import { requestVerifier, workerActions, workerSecret } from './transport.js';
import { listJobs } from '../reconstruction/jobs.js';

export function workerServer({ queue, handler, secret = workerSecret() }) {
  const verify = requestVerifier(secret);
  let admission = Promise.resolve();
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      const url = new URL(req.url, 'http://worker');
      if (req.method === 'GET' && url.pathname === '/healthz') {
        res.statusCode = queue.ready ? 200 : 503;
        res.setHeader('Content-Type', 'application/json');
        return res.end(
          JSON.stringify({ status: queue.ready ? 'ready' : 'unavailable' }),
        );
      }
      if (!queue.ready || queue.stopping)
        throw Object.assign(Error('Worker is restarting. Try again shortly.'), {
          status: 503,
        });
      const action = url.searchParams.get('action');
      if (
        url.pathname !== '/api/builder' ||
        workerActions.get(action) !== req.method
      )
        throw Object.assign(Error('Unknown worker operation.'), {
          status: 404,
        });
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += bytes.length;
        if (size > 65536)
          throw Object.assign(Error('Request too large.'), { status: 413 });
        chunks.push(bytes);
      }
      const raw = Buffer.concat(chunks).toString('utf8');
      verify(req, raw);
      try {
        req.body = JSON.parse(raw || '{}');
      } catch {
        throw Object.assign(Error('Invalid request body.'), { status: 400 });
      }
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
        throw Object.assign(Error('Invalid request body.'), { status: 400 });
      if (action === 'reconstruct') {
        // Serialize admission, quota reservation and the project/queue commit.
        const run = admission.then(async () => {
          if (!queue.ready || queue.stopping)
            throw Object.assign(Error('Worker is restarting.'), {
              status: 503,
            });
          const jobs = (await listJobs()).filter(
            (j) => j.managed && ['queued', 'running'].includes(j.status),
          );
          // Idempotent retries must still reach the existing job when capacity is full.
          const { ownerFrom } = await import('../storage.js');
          const owner = ownerFrom(req);
          const duplicate = jobs.some(
            (j) => j.owner === owner && j.project === req.body.id,
          );
          if (
            !duplicate &&
            jobs.length >= Number(process.env.FUSION_WORKER_MAX_PENDING || 20)
          )
            throw Object.assign(
              Error(
                'The browser queue is full. Try again after a website finishes.',
              ),
              { status: 429 },
            );
          if (!duplicate && jobs.filter((j) => j.owner === owner).length >= 3)
            throw Object.assign(
              Error(
                'This workspace already has three websites queued. Wait for one to finish.',
              ),
              { status: 429 },
            );
          return handler(req, res);
        });
        admission = run.catch(() => {});
        await run;
      } else await handler(req, res);
    } catch (error) {
      if (res.writableEnded) return;
      res.statusCode = error.status || 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: error.status
            ? error.message
            : 'The worker could not complete this request. Retry shortly.',
        }),
      );
    }
  });
  server.requestTimeout = 120000;
  server.headersTimeout = 15000;
  server.keepAliveTimeout = 5000;
  server.drainAdmissions = () => admission;
  return server;
}
