import { atomicWrite } from '../server/worker/atomic.js';
import { cachedCapture, cacheCapture } from '../server/reconstruction/cache.js';
import { editCapturedSite } from '../server/reconstruction/agent.js';
import { aiConfigured, modelJSON } from '../server/model.js';
import { durableModel } from '../server/reconstruction/model-cache.js';
import { readJob, saveJob, jobPath } from '../server/reconstruction/jobs.js';
import { read, write, projectKey } from '../server/storage.js';
import {
  captureReference,
  CAPTURE_VERSION,
} from '../server/reconstruction/capture.js';
import { assembleCapture } from '../server/reconstruction/assemble.js';
import { compareCapture } from '../server/reconstruction/compare.js';
import { verifyReconstruction } from '../server/reconstruction/verify.js';
import {
  runWorkflow,
  workflowSteps,
  workflowFingerprint,
} from '../server/reconstruction/workflow.js';
import { readFile, unlink, access } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const id = process.argv[2];
// Wait for the parent's durable start marker, rather than racing its final PID write.
const dir = jobPath(id);
for (let i = 0; i < 100; i++) {
  try {
    const marker = await readFile(path.join(dir, 'start'), 'utf8');
    if (
      process.env.FUSION_JOB_RUN_ID &&
      marker !== process.env.FUSION_JOB_RUN_ID
    )
      throw Error('Waiting for worker lease.');
    break;
  } catch {
    if (i === 99) process.exit(1);
    await new Promise((r) => setTimeout(r, 100));
  }
}
let job = await readJob(id);
job.body.mode ||= 'clone';
const abort = new AbortController();
let shuttingDown = false;
let exitDeadline;
const shutdown = () => {
  shuttingDown = true;
  abort.abort(
    Error('Worker restarting; the saved checkpoint will resume automatically.'),
  );
  exitDeadline ||= setTimeout(() => process.exit(1), 10000);
};
if (job.managed) {
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('disconnect', shutdown);
}

const deadline = setTimeout(
  () =>
    abort.abort(
      Error(
        'The workflow reached its 30-minute limit. Resume to continue from its checkpoint.',
      ),
    ),
  1800000,
);
const cancelled = setInterval(
  () =>
    access(path.join(dir, 'cancel'))
      .then(() => abort.abort(Error('Website workflow stopped.')))
      .catch(() => {}),
  1000,
);
let eventQueue = Promise.resolve();
function event(update) {
  eventQueue = eventQueue.then(async () => {
    const events = job.events || [];
    if (update.stage && update.stage !== events.at(-1)?.stage)
      events.push({
        stage: update.stage,
        phase: update.phase || job.phase,
        at: Date.now(),
      });
    job = {
      ...job,
      ...update,
      updatedAt: Date.now(),
      events: events.slice(-80),
    };
    await saveJob(job);
  });
  return eventQueue;
}
const heartbeat = job.managed
  ? setInterval(() => {
      void event({}).catch(() => shutdown());
    }, 10000)
  : null;
const onArtifact = (name, bytes) => atomicWrite(path.join(dir, name), bytes);
const loadJson = async (name) => {
  try {
    return JSON.parse(await readFile(path.join(dir, name), 'utf8'));
  } catch {
    return null;
  }
};
const currentProject = async () => {
  abort.signal.throwIfAborted();
  if (
    job.managed &&
    (await readJob(id)).runId !== process.env.FUSION_JOB_RUN_ID
  )
    throw Error('This worker attempt has been superseded.');
  const project = await read(projectKey(job.owner, job.project));
  if (!project || project.deleted || project.revision !== job.revision)
    throw Error(
      'The project changed while this workflow was running. Its saved version is unchanged.',
    );
  return project;
};
try {
  const savedProject = await read(projectKey(job.owner, job.project));
  if (savedProject?.versions?.some((version) => version.jobId === id)) {
    await event({
      status: 'completed',
      stage: 'Your website is ready',
      completedSteps: workflowSteps(job.body.mode),
      browser: null,
    });
  } else {
    await event({
      status: 'running',
      stage: 'Starting website workflow',
      steps: workflowSteps(job.body.mode),
    });
    let project = await currentProject();
    if (!job.reference && job.body.mode !== 'edit')
      throw Error('Choose a supported Framer reference before building.');
    let capture = await loadJson('capture.json');
    if (capture && capture.version !== CAPTURE_VERSION) capture = null;
    const getCapture = async () => {
      if (!capture)
        capture = await cachedCapture(job.reference.previewUrl, dir);
      if (capture) await event({ stage: 'Using the saved browser capture' });
      else {
        capture = await captureReference(job.reference, {
          signal: abort.signal,
          onEvent: event,
          onArtifact,
        });
        await cacheCapture(capture, dir);
      }
      await onArtifact('capture.json', JSON.stringify(capture));
      return capture;
    };
    const stored = await loadJson('workflow.json');
    const fingerprint = workflowFingerprint(project, job.body);
    if (job.fingerprint && job.fingerprint !== fingerprint)
      throw Error(
        'This workflow no longer matches the project. Start a new request.',
      );
    const checkpoint =
      stored?.fingerprint === fingerprint ? stored.state : undefined;
    const assets = await Promise.all(
      (project.assets || []).map(async (a) => ({
        ...a,
        data: (await read(`assets/${a.id}.json`))?.data,
      })),
    );
    await write(projectKey(job.owner, job.project), {
      ...project,
      generation: {
        engine: 'reconstruction',
        jobId: id,
        mode: job.body.mode,
        prompt: job.body.prompt,
        completed: checkpoint?.completed?.length || 0,
        total: workflowSteps(job.body.mode).length,
        draftSite: checkpoint?.site || null,
      },
      generationError: null,
      failedPrompt: job.body.prompt,
    });
    const { status, state } = await runWorkflow(
      { project, body: job.body, checkpoint, signal: abort.signal },
      {
        capture: getCapture,
        assemble: assembleCapture,
        aiConfigured,
        onEvent: event,
        onCheckpoint: async (state) => {
          await onArtifact(
            'workflow.json',
            JSON.stringify({ fingerprint, state }),
          );
          if (state.site)
            await onArtifact('site.json', JSON.stringify(state.site));
          if (state.comparison)
            await onArtifact(
              'comparison.json',
              JSON.stringify(state.comparison),
            );
          const latest = await currentProject();
          await write(projectKey(job.owner, job.project), {
            ...latest,
            generation: {
              engine: 'reconstruction',
              jobId: id,
              mode: job.body.mode,
              prompt: job.body.prompt,
              completed: state.completed.length,
              total: workflowSteps(job.body.mode).length,
              draftSite: state.site,
            },
            reconstruction: {
              ...latest.reconstruction,
              jobId: id,
              mode: job.body.mode,
              status: 'running',
              ...(state.comparison
                ? {
                    comparisonJobId: id,
                    report: state.comparison,
                    coverage: state.coverage,
                  }
                : {}),
            },
          });
          await event({
            checkpointAt: Date.now(),
            completedSteps: state.completed,
          });
        },
        compare: async (site) =>
          compareCapture(capture || (await getCapture()), site, {
            signal: abort.signal,
            onEvent: event,
            readArtifact: (name) => readFile(path.join(dir, name)),
            onArtifact,
          }),
        edit: (options) =>
          editCapturedSite({
            ...options,
            callModel: durableModel({
              dir,
              callModel: modelJSON,
              onReuse: () => event({ stage: 'Using the saved Kimi response' }),
            }),
            reference: job.reference,
            inspection: {
              evidence: capture?.viewports.map(({ width, measured }) => ({
                width,
                sections: measured.sections,
                controls: measured.controls,
              })),
            },
            assets,
            signal: abort.signal,
            onProgress: ({ phase, ...update }) => {
              void event({ ...update, modelPhase: phase });
            },
          }),
        verify: (site) =>
          verifyReconstruction(site, {
            assets,
            signal: abort.signal,
            onEvent: event,
          }),
      },
    );
    abort.signal.throwIfAborted();
    project = await currentProject();
    const baseline = state.comparison
      ? {
          report: state.comparison,
          coverage: state.coverage,
          source: job.reference.previewUrl,
          comparisonJobId: id,
        }
      : project.reconstruction;
    const reconstruction = {
      ...baseline,
      jobId: id,
      mode: job.body.mode,
      status:
        status === 'completed'
          ? job.body.mode === 'clone'
            ? 'matched'
            : 'edited'
          : 'needs-correction',
    };
    if (status === 'completed') {
      const site = state.site;
      if (job.body.mode === 'clone')
        site.reply =
          'Reconstructed the reference and checked its desktop, tablet and phone layouts. You can now request changes in chat.';
      const version = {
        id: randomUUID(),
        jobId: id,
        site,
        prompt: job.body.prompt,
        requestId: job.body.requestId,
        createdAt: Date.now(),
      };
      const versions = [
        ...project.versions.slice(0, project.activeVersion + 1),
        version,
      ].slice(-12);
      const { thumbnail, ...validation } =
        state.verification || state.comparison;
      await write(projectKey(job.owner, job.project), {
        ...project,
        site,
        name: site.title,
        description: site.description,
        thumbnail: thumbnail || project.thumbnail,
        versions,
        activeVersion: versions.length - 1,
        revision: project.revision + 1,
        updatedAt: Date.now(),
        status: 'Draft',
        generation: null,
        generationError: null,
        failedPrompt: null,
        reconstruction,
        validation,
        messages: [
          ...project.messages,
          { role: 'user', text: job.body.prompt },
          { role: 'assistant', text: site.reply, changed: true },
        ].slice(-80),
      });
      await event({
        status: 'completed',
        phase: 'complete',
        stage: 'Your website is ready',
        completedSteps: workflowSteps(job.body.mode),
        browser: null,
        report: state.comparison || null,
      });
    } else {
      await write(projectKey(job.owner, job.project), {
        ...project,
        reconstruction,
        generationError:
          'The draft needs correction before it can be saved as a finished version. Review the browser checks and retry.',
        failedPrompt: job.body.prompt,
        updatedAt: Date.now(),
      });
      await event({
        status: 'needs-correction',
        stage: 'The draft needs correction',
        browser: null,
        report: state.comparison || state.verification,
      });
    }
  }
} catch (error) {
  const status = shuttingDown
    ? 'queued'
    : abort.signal.aborted
      ? 'cancelled'
      : 'failed';
  const message = abort.signal.aborted
    ? abort.signal.reason?.message || 'Website workflow stopped.'
    : error.message;
  await event({
    status,
    stage:
      status === 'cancelled'
        ? 'Website workflow stopped'
        : 'Website workflow paused',
    error: message,
    browser: null,
  });
  const project = await read(projectKey(job.owner, job.project)).catch(
    () => null,
  );
  if (
    !shuttingDown &&
    project &&
    !project.deleted &&
    project.revision === job.revision &&
    project.reconstruction?.jobId === id
  )
    await write(projectKey(job.owner, job.project), {
      ...project,
      reconstruction: { ...project.reconstruction, status },
      generationError: message,
      failedPrompt: job.body.prompt,
      updatedAt: Date.now(),
    });
} finally {
  clearTimeout(deadline);
  clearInterval(cancelled);
  clearInterval(heartbeat);
  clearTimeout(exitDeadline);
  process.removeListener('disconnect', shutdown);
  process.removeListener('SIGTERM', shutdown);
  process.removeListener('SIGINT', shutdown);
  if (process.connected) process.disconnect();
  // Do not remove a lock that has already been claimed by a newer worker.
  if (
    !shuttingDown &&
    (await readFile(job.lock, 'utf8').catch(() => null)) === id
  )
    await unlink(job.lock).catch(() => {});
}
