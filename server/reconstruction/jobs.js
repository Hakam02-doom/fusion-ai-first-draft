import { atomicWrite } from '../worker/atomic.js';
import {
  mkdir,
  readFile,
  writeFile,
  open,
  unlink,
  copyFile,
  stat,
  readdir,
} from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import path from 'node:path';
import { workflowFingerprint, workflowSteps } from './workflow.js';
export const jobRoot = () =>
  path.resolve(process.env.FUSION_JOB_DIR || '.fusion-jobs');
export const jobPath = (id) => {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw Error('Invalid reconstruction job.');
  return path.join(jobRoot(), id);
};
export async function readJob(id, owner) {
  let job;
  try {
    job = JSON.parse(
      await readFile(path.join(jobPath(id), 'job.json'), 'utf8'),
    );
  } catch (error) {
    if (error.code === 'ENOENT')
      throw Object.assign(Error('Job not found.'), { status: 404 });
    throw error;
  }
  if (owner && job.owner !== owner)
    throw Object.assign(Error('Job not found.'), { status: 404 });
  if (
    owner &&
    !job.managed &&
    ['running', 'queued'].includes(job.status) &&
    Date.now() - job.updatedAt > 15000
  ) {
    try {
      if (!job.pid) throw Error('Worker did not start.');
      process.kill(job.pid, 0);
    } catch {
      job.status = 'interrupted';
      job.error =
        'The background worker stopped. Resume to use the saved reference capture.';
      await saveJob(job);
    }
  }
  return job;
}
export async function saveJob(job) {
  const dir = jobPath(job.id);
  await mkdir(dir, { recursive: true });
  if (process.env.FUSION_JOB_RUN_ID && job.managed) {
    const existing = await readJob(job.id);
    if (existing.runId !== process.env.FUSION_JOB_RUN_ID)
      throw Error('This worker attempt has been superseded.');
  }
  await atomicWrite(path.join(dir, 'job.json'), JSON.stringify(job));
}
export function publicJob(job) {
  const {
    owner: _owner,
    project: _project,
    body: _body,
    lock: _lock,
    pid: _pid,
    runId: _runId,
    ready: _ready,
    managed: _managed,
    ...safe
  } = job;
  return safe;
}
export async function startJob(
  owner,
  project,
  body,
  { beforeStart, onQueued } = {},
) {
  if (process.env.VERCEL)
    throw Error(
      'Reconstruction requires the dedicated worker service. Run the local worker-enabled development server for now.',
    );
  await mkdir(jobRoot(), { recursive: true });
  const fingerprint = workflowFingerprint(project, body);
  const finished = project.versions?.find(
    (v) => v.requestId === body.requestId && v.jobId,
  );
  if (finished) return publicJob(await readJob(finished.jobId, owner));
  const lock = path.join(
    jobRoot(),
    createHash('sha256')
      .update(owner + project.id)
      .digest('hex') + '.lock',
  );
  let handle;
  try {
    handle = await open(lock, 'wx', 0o600);
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
    const id = await readFile(lock, 'utf8');
    let previous;
    try {
      previous = await readJob(id, owner);
    } catch {}
    if (!previous && Date.now() - (await stat(lock)).mtimeMs < 15000)
      throw Object.assign(
        Error('This website workflow is starting. Please wait a moment.'),
        { status: 409 },
      );
    if (previous && ['queued', 'running'].includes(previous.status)) {
      try {
        if (previous.managed) {
          /* The queue supervisor owns liveness. */
        } else if (previous.pid) process.kill(previous.pid, 0);
        else if (Date.now() - previous.createdAt >= 15000)
          throw Error('Worker did not start.');
      } catch {
        previous.status = 'interrupted';
        previous.error = 'Worker interrupted. Resume uses its saved capture.';
        await saveJob(previous);
      }
      if (previous.status !== 'interrupted') {
        if (previous.fingerprint !== fingerprint)
          throw Object.assign(
            Error(
              'Another request is running for this website. Stop it or wait before sending a different request.',
            ),
            { status: 409 },
          );
        return publicJob(previous);
      }
    }
    await unlink(lock).catch(() => {});
    handle = await open(lock, 'wx', 0o600);
  }
  const job = {
    id: randomUUID(),
    managed: process.env.FUSION_WORKER_PROCESS === 'true',
    ready: false,
    owner,
    project: project.id,
    body,
    mode: body.mode,
    fingerprint,
    steps: workflowSteps(body.mode),
    completedSteps: [],
    reference: project.reference,
    status: 'queued',
    stage: 'Waiting for browser worker',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    revision: project.revision,
    events: [],
    attempt: 0,
    lock,
  };
  await handle.writeFile(job.id);
  await handle.close();
  try {
    let resuming = false;
    const resumeId = project.generation?.jobId;
    if (resumeId) {
      const previous = await readJob(resumeId, owner).catch(() => null);
      if (
        previous &&
        previous.project === project.id &&
        previous.fingerprint === fingerprint &&
        !['queued', 'running', 'completed'].includes(previous.status)
      ) {
        resuming = true;
        job.resumedFrom = resumeId;
        await mkdir(jobPath(job.id), { recursive: true });
        for (const name of [
          'workflow.json',
          'capture.json',
          'comparison.json',
          ...(await readdir(jobPath(resumeId))).filter((name) =>
            /^model-response-[a-f0-9]{64}\.json$/.test(name),
          ),
          ...[1440, 768, 390].flatMap((w) => [
            `reference-${w}.png`,
            `generated-${w}.png`,
          ]),
        ])
          await copyFile(
            path.join(jobPath(resumeId), name),
            path.join(jobPath(job.id), name),
          ).catch((e) => {
            if (e.code !== 'ENOENT') throw e;
          });
      }
    }
    await beforeStart?.({ resuming });
    await saveJob(job);
    await onQueued?.(publicJob(job));
    if (job.managed) {
      job.ready = true;
      await saveJob(job);
      return publicJob(job);
    }
    const child = spawn(
      process.execPath,
      ['scripts/reconstruction-worker.mjs', job.id],
      {
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore',
        env: { ...process.env },
      },
    );
    await new Promise((resolve, reject) => {
      child.once('spawn', resolve);
      child.once('error', reject);
    });
    job.pid = child.pid;
    await saveJob(job);
    await writeFile(path.join(jobPath(job.id), 'start'), 'start', {
      mode: 0o600,
    });
    child.unref();
    return publicJob(job);
  } catch (error) {
    await unlink(lock).catch(() => {});
    await saveJob({
      ...job,
      status: 'failed',
      error: error.message,
      updatedAt: Date.now(),
    });
    throw error;
  }
}
export async function cancelJob(id, owner) {
  const job = await readJob(id, owner);
  if (['queued', 'running'].includes(job.status))
    await atomicWrite(path.join(jobPath(id), 'cancel'), 'cancel');
  return publicJob(job);
}
export async function artifact(id, owner, name) {
  await readJob(id, owner);
  if (!/^(reference|generated)-(1440|768|390)\.png$/.test(name))
    throw Error('Unknown comparison image.');
  return readFile(path.join(jobPath(id), name));
}

export async function releaseJobLock(job) {
  if (
    job.lock &&
    (await readFile(job.lock, 'utf8').catch(() => null)) === job.id
  )
    await unlink(job.lock).catch(() => {});
}
export async function listJobs() {
  await mkdir(jobRoot(), { recursive: true });
  const ids = (await readdir(jobRoot())).filter((id) =>
    /^[a-f0-9-]{36}$/.test(id),
  );
  const jobs = await Promise.all(
    ids.map((id) =>
      readJob(id).catch((error) => {
        // An admission can create its directory before committing job.json.
        if (error.status === 404) return null;
        throw error;
      }),
    ),
  );
  return jobs.filter(Boolean);
}
