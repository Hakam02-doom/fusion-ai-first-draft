import { createHash } from 'node:crypto';

export const WORKFLOW_VERSION = 1;
export const workflowSteps = (mode) =>
  mode === 'edit'
    ? ['editing', 'checking', 'saving']
    : [
        'capturing',
        'rebuilding',
        'comparing',
        ...(mode === 'build' ? ['personalizing', 'checking'] : []),
        'saving',
      ];

export function workflowMode(project, body = {}) {
  if (body.mode !== undefined) {
    if (!['build', 'clone', 'edit'].includes(body.mode))
      throw Error('Choose a valid website workflow.');
    if (body.mode === 'edit' && !project.site?.variants?.length)
      throw Error(
        'Reconstruct a reference before editing it with this workflow.',
      );
    return body.mode;
  }
  return project.site?.variants?.length ? 'edit' : 'build';
}

export function workflowFingerprint(project, body) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        version: WORKFLOW_VERSION,
        revision: project.revision,
        reference: project.reference?.previewUrl,
        mode: body.mode,
        prompt: body.prompt,
        assets: (project.assets || []).map((a) => [a.id, a.url, a.description]),
      }),
    )
    .digest('hex');
}

// Dependencies are injected so the real sequence, checkpoint boundaries and recovery can be tested without a provider.
export async function runWorkflow(
  { project, body, checkpoint, signal },
  services,
) {
  const mode = body.mode;
  const steps = workflowSteps(mode);
  const state = structuredClone(
    checkpoint || { version: WORKFLOW_VERSION, completed: [] },
  );
  const event = (phase, stage) => {
    signal?.throwIfAborted();
    return services.onEvent({
      phase,
      stage,
      steps,
      completedSteps: state.completed,
    });
  };
  const save = async (phase, update) => {
    Object.assign(state, update);
    if (!state.completed.includes(phase)) state.completed.push(phase);
    signal?.throwIfAborted();
    await services.onCheckpoint(state);
  };
  signal?.throwIfAborted();
  if (mode !== 'edit') {
    if (!state.site) {
      await event('capturing', 'Opening the reference in the browser');
      const capture = await services.capture();
      if (!state.completed.includes('capturing'))
        state.completed.push('capturing');
      await event(
        'rebuilding',
        'Rebuilding the reference layout, assets and interactions',
      );
      await save('rebuilding', {
        site: await services.assemble(capture),
        coverage: {
          capturedControls: capture.interactions.length,
          warnings: capture.warnings,
          scope: 'Homepage; linked pages remain reference links.',
        },
      });
    }
    if (!state.comparison?.passed) {
      await event(
        'comparing',
        'Comparing the reference at desktop, tablet and phone sizes',
      );
      let report = await services.compare(state.site);
      if (
        !report.passed &&
        !state.referenceRepairAttempted &&
        (await services.aiConfigured())
      ) {
        await save('rebuilding', {
          referenceRepairAttempted: true,
          comparison: report,
        });
        await event(
          'comparing',
          'Repairing measured differences in the reference layout',
        );
        const repaired = await services.edit({
          previous: state.site,
          repair: report,
          prompt:
            'Correct only the measured differences from the captured reference.',
        });
        await save('rebuilding', { site: repaired });
        report = await services.compare(repaired);
      }
      await save('comparing', { comparison: report });
      if (!report.passed) return { status: 'needs-correction', state };
    }
  } else if (!state.site) {
    state.site = project.site;
  }
  const editingPhase = mode === 'build' ? 'personalizing' : 'editing';
  if (mode !== 'clone' && !state.completed.includes(editingPhase)) {
    await event(
      editingPhase,
      mode === 'build'
        ? 'Adapting the captured website to your brief with Kimi'
        : 'Applying your changes with Kimi',
    );
    const site = await services.edit({
      previous: state.site,
      prompt: body.prompt,
      personalize: mode === 'build',
    });
    await save(editingPhase, { site });
  }
  if (mode !== 'clone' && !state.verification?.passed) {
    await event('checking', 'Checking the updated website at all three sizes');
    let verification = await services.verify(state.site);
    if (!verification.passed && !state.editRepairAttempted) {
      await save(editingPhase, { editRepairAttempted: true });
      await event('checking', 'Fixing issues found in the updated website');
      const site = await services.edit({
        previous: state.site,
        prompt: body.prompt,
        repair: verification,
      });
      await save(editingPhase, { site });
      verification = await services.verify(site);
    }
    await save('checking', { verification });
    if (!verification.passed) return { status: 'needs-correction', state };
  }
  await event('saving', 'Saving your website and version history');
  return { status: 'completed', state };
}
