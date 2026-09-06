import { workerSecret } from '../server/worker/transport.js';
import { WorkerQueue } from '../server/worker/queue.js';
import { workerServer } from '../server/worker/http.js';

if (process.env.VERCEL)
  throw Error(
    'Run the worker as a persistent Node service, outside Vercel Functions.',
  );
workerSecret();
if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.FUSION_JOB_DIR)
)
  throw Error(
    'Production requires shared private Blob storage and FUSION_JOB_DIR on a persistent volume.',
  );
process.env.FUSION_WORKER_PROCESS = 'true';
if (process.env.NODE_ENV === 'production') await import('./check-worker.mjs');
const { default: handler } = await import('../api/builder.js');
const queue = new WorkerQueue();
await queue.start();
const server = workerServer({ queue, handler });
const port = Number(process.env.PORT || 3101);
server.listen(port, process.env.FUSION_WORKER_HOST || '0.0.0.0', () => {
  console.log(
    `Fusion browser worker listening on port ${server.address().port}.`,
  );
  process.send?.({ port: server.address().port });
});
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  queue.ready = false;
  queue.stopping = true;
  const deadline = setTimeout(() => process.exit(1), 28000);
  server.close();
  await server.drainAdmissions();
  await queue.stop();
  server.closeAllConnections();
  clearTimeout(deadline);
  process.exit(0);
}
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
process.on('disconnect', stop);
server.on('error', async () => {
  await stop();
});
