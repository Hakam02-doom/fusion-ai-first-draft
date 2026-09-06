import { fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { access, mkdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import {
  jobRoot,
  jobPath,
  listJobs,
  readJob,
  saveJob,
  releaseJobLock,
} from '../reconstruction/jobs.js';
import { projectKey, read, write } from '../storage.js';
import { workflowSteps } from '../reconstruction/workflow.js';
import { atomicWrite } from './atomic.js';
const active = (job) => ['queued', 'running'].includes(job.status);
const exists = async (file) =>
  access(file).then(
    () => true,
    () => false,
  );

// One supervisor per persistent volume; deliberately not a distributed queue.
export class WorkerQueue {
  constructor({
    concurrency = Number(process.env.FUSION_WORKER_CONCURRENCY || 1),
    launch = (job) =>
      fork('scripts/reconstruction-worker.mjs', [job.id], {
        cwd: process.cwd(),
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        env: { ...process.env, FUSION_JOB_RUN_ID: job.runId },
      }),
    interval = 1000,
  } = {}) {
    if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 4)
      throw Error('Worker concurrency must be between 1 and 4.');
    this.concurrency = concurrency;
    this.launch = launch;
    this.interval = interval;
    this.children = new Map();
    this.token = randomUUID();
    this.stopping = false;
    this.ready = false;
    this.lease = path.join(jobRoot(), 'supervisor');
  }
  async claim() {
    await mkdir(jobRoot(), { recursive: true });
    try {
      await mkdir(this.lease);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const stamp = await stat(path.join(this.lease, 'lease.json')).catch(() =>
        stat(this.lease),
      );
      if (Date.now() - stamp.mtimeMs < 60000)
        throw Error(
          'Another worker owns this volume, or its restart lease has not expired. Retry in 60 seconds.',
        );
      await rm(this.lease, { recursive: true });
      await mkdir(this.lease);
    }
    await atomicWrite(
      path.join(this.lease, 'lease.json'),
      JSON.stringify({ token: this.token }),
    );
  }
  async heartbeat() {
    const lease = JSON.parse(
      await readFile(path.join(this.lease, 'lease.json'), 'utf8'),
    );
    if (lease.token !== this.token)
      throw Error('Worker volume ownership changed.');
    await atomicWrite(
      path.join(this.lease, 'lease.json'),
      JSON.stringify({ token: this.token }),
    );
  }
  async finish(job, status, error) {
    job.status = status;
    job.error = error || null;
    job.stage =
      status === 'completed'
        ? 'Your website is ready'
        : status === 'cancelled'
          ? 'Website workflow stopped'
          : 'Website workflow paused';
    job.updatedAt = Date.now();
    job.browser = null;
    if (status === 'completed') job.completedSteps = workflowSteps(job.mode);
    await saveJob(job);
    await releaseJobLock(job);
    if (status !== 'completed') {
      const project = await read(projectKey(job.owner, job.project));
      if (
        project &&
        !project.deleted &&
        project.revision === job.revision &&
        project.reconstruction?.jobId === job.id
      )
        await write(projectKey(job.owner, job.project), {
          ...project,
          generationError: error,
          failedPrompt: job.body.prompt,
          reconstruction: { ...project.reconstruction, status },
        });
    }
  }
  async recover(job) {
    const project = await read(projectKey(job.owner, job.project));
    if (project?.versions?.some((v) => v.jobId === job.id)) {
      await this.finish(job, 'completed');
      return;
    }
    if (await exists(path.join(jobPath(job.id), 'cancel'))) {
      await this.finish(job, 'cancelled', 'Website workflow stopped.');
      return;
    }
    if (
      !project ||
      project.deleted ||
      project.revision !== job.revision ||
      project.reconstruction?.jobId !== job.id
    ) {
      await this.finish(
        job,
        'failed',
        'This project changed or the request was interrupted before it was queued. Start a new request.',
      );
      return;
    }
    if ((job.attempt || 0) >= 3) {
      await this.finish(
        job,
        'failed',
        'The worker restarted repeatedly. Your checkpoint is saved; retry to continue.',
      );
      return;
    }
    await saveJob({
      ...job,
      status: 'queued',
      ready: true,
      pid: null,
      runId: null,
      stage: 'Resuming from the saved checkpoint',
      updatedAt: Date.now(),
    });
  }
  async start() {
    await this.claim();
    try {
      for (const job of await listJobs())
        if (job.managed && active(job)) await this.recover(job);
      this.ready = true;
      await this.tick();
      this.timer = setInterval(() => {
        void this.tick().catch((error) => {
          this.ready = false;
          this.error = error.message;
        });
      }, this.interval);
    } catch (error) {
      await this.stop();
      throw error;
    }
  }
  async tick() {
    if (this.stopping || this.ticking) return;
    this.ticking = (async () => {
      await this.heartbeat();
      for (const [id, child] of this.children) {
        if (child.exitCode !== null || child.signalCode || child.workerExited) {
          this.children.delete(id);
          const job = await readJob(id);
          if (active(job)) await this.recover(job);
        }
      }
      const queued = (await listJobs())
        .filter(
          (j) =>
            j.managed &&
            j.ready &&
            j.status === 'queued' &&
            !this.children.has(j.id),
        )
        .sort((a, b) => a.createdAt - b.createdAt);
      for (const job of queued) {
        if (await exists(path.join(jobPath(job.id), 'cancel'))) {
          await this.finish(job, 'cancelled', 'Website workflow stopped.');
          continue;
        }
        if (this.children.size >= this.concurrency) continue;
        const runId = randomUUID();
        const running = {
          ...job,
          runId,
          status: 'running',
          stage: 'Starting browser worker',
          attempt: (job.attempt || 0) + 1,
          updatedAt: Date.now(),
        };
        await rm(path.join(jobPath(job.id), 'start'), { force: true });
        await saveJob(running);
        let child;
        try {
          child = this.launch(running);
          this.children.set(job.id, child);
          child.once('error', () => {
            child.workerExited = true;
          });
          child.once('exit', () => {
            child.workerExited = true;
          });
          await saveJob({ ...running, pid: child.pid });
          await atomicWrite(path.join(jobPath(job.id), 'start'), runId);
        } catch (error) {
          child?.kill('SIGTERM');
          if (!child) await this.recover(running);
          throw error;
        }
      }
      this.ready = true;
      this.error = null;
    })();
    try {
      await this.ticking;
    } finally {
      this.ticking = null;
    }
  }
  async stop({ graceMs = 15000 } = {}) {
    this.stopping = true;
    this.ready = false;
    clearInterval(this.timer);
    await this.ticking?.catch(() => {});
    for (const child of this.children.values()) child.kill('SIGTERM');
    const until = Date.now() + graceMs;
    while (
      [...this.children.values()].some(
        (c) => c.exitCode === null && !c.signalCode && !c.workerExited,
      ) &&
      Date.now() < until
    )
      await new Promise((resolve) => setTimeout(resolve, 100));
    for (const child of this.children.values())
      if (child.exitCode === null && !child.signalCode && !child.workerExited)
        child.kill('SIGKILL');
    // Wait for exit before releasing ownership or allowing another attempt.
    await Promise.all(
      [...this.children.values()].map((child) =>
        child.workerExited || child.exitCode !== null || child.signalCode
          ? undefined
          : new Promise((resolve) => child.once('exit', resolve)),
      ),
    );
    const lease = JSON.parse(
      await readFile(path.join(this.lease, 'lease.json'), 'utf8').catch(
        () => '{}',
      ),
    );
    if (lease.token === this.token)
      await rm(this.lease, { recursive: true, force: true });
  }
}
