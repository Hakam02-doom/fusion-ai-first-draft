const keyName = 'fusion-workspace-key-v1';
export function workspaceKey() {
  let key = localStorage.getItem(keyName);
  if (!/^[a-f0-9]{64}$/.test(key || '')) {
    key = Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
      n.toString(16).padStart(2, '0'),
    ).join('');
    localStorage.setItem(keyName, key);
  }
  return key;
}
export function restoreWorkspace(key) {
  if (!/^[a-f0-9]{64}$/.test(key.trim()))
    throw new Error(
      'Enter the 64-character recovery key from your other device.',
    );
  localStorage.setItem(keyName, key.trim());
  location.href = '/dashboard';
}
export async function api(
  action,
  body,
  { signal, query = '', binary = false } = {},
) {
  const r = await fetch(`/api/builder?action=${action}${query}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${workspaceKey()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  if (binary && r.ok) return r.blob();
  const data = await r
    .json()
    .catch(() => ({ error: 'The server is unavailable. Please retry.' }));
  if (!r.ok || data.error)
    throw Object.assign(new Error(data.error || 'Request failed.'), {
      status: r.status,
    });
  return data;
}
export async function generate(
  id,
  prompt,
  onStage,
  signal,
  { redesign = false, onProgress, onCheckpoint } = {},
) {
  const requestId = crypto.randomUUID();
  for (let step = 0; step < 10; step++) {
    signal?.throwIfAborted();
    const r = await fetch('/api/builder?action=generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${workspaceKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        prompt,
        requestId,
        redesign,
      }),
      signal,
    });
    if (!r.ok) {
      const data = await r.json();
      throw new Error(data.error || 'Generation failed.');
    }
    if (!r.headers.get('content-type')?.includes('ndjson')) return r.json();
    const reader = r.body.getReader(),
      decoder = new TextDecoder();
    let buffer = '',
      result,
      continuation = false;
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.error) throw new Error(event.error);
        if (event.stage) onStage(event.stage);
        if (event.progress) onProgress?.(event.progress);
        if (event.checkpoint) onCheckpoint?.(event.checkpoint);
        if (event.continuation) continuation = true;
        if (event.result) result = event.result;
      }
      if (done) break;
    }
    if (!result && continuation) continue;
    if (!result)
      throw new Error(
        'The connection ended before generation finished. Reload the project to check its saved version.',
      );
    return result;
  }
  throw new Error(
    'Generation paused. Retry to continue from the last saved step.',
  );
}
export async function imageData(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    throw new Error('Choose a PNG, JPEG or WebP image.');
  if (file.size > 1200000)
    throw new Error('Choose an image smaller than 1.2 MB.');
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('This image could not be read.'));
    r.readAsDataURL(file);
  });
}
export async function exportProject(id) {
  const blob = await api('export', { id }, { binary: true });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fusion-website.zip';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function watchReconstruction(
  id,
  jobId,
  onStage,
  signal,
  { onJob, onCheckpoint } = {},
) {
  let previousStage = '',
    checkpointAt = null;
  const wait = (ms) =>
    new Promise((resolve, reject) => {
      const stop = () => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', stop);
        reject(signal?.reason || new DOMException('Stopped', 'AbortError'));
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', stop);
        resolve();
      }, ms);
      signal?.addEventListener('abort', stop, { once: true });
      if (signal?.aborted) stop();
    });
  const poll = async (action, query) => {
    const started = Date.now();
    let attempts = 0;
    while (true) {
      signal?.throwIfAborted();
      try {
        return await api(action, null, { query, signal });
      } catch (error) {
        signal?.throwIfAborted();
        if (
          !(
            error instanceof TypeError ||
            [429, 502, 503, 504].includes(error.status)
          ) ||
          Date.now() - started > 120000
        )
          throw error;
        previousStage = '';
        onStage('Reconnecting to the browser worker. Your progress is saved.');
        await wait(Math.min(10000, 2000 * ++attempts));
      }
    }
  };
  while (true) {
    signal?.throwIfAborted();
    const job = await poll(
      'reconstruction-job',
      `&job=${encodeURIComponent(jobId)}`,
    );
    if (job.stage !== previousStage) {
      previousStage = job.stage;
      onStage(job.stage);
    }
    onJob?.(job);
    if (job.checkpointAt && checkpointAt !== job.checkpointAt) {
      const project = await poll('project', `&id=${id}`);
      checkpointAt = job.checkpointAt;
      if (project.generation) onCheckpoint?.(project.generation);
    }
    if (['completed', 'needs-correction'].includes(job.status))
      return poll('project', `&id=${id}`);
    if (['failed', 'cancelled', 'interrupted'].includes(job.status))
      throw Error(job.error || job.stage);
    await wait(2000);
  }
}
export async function reconstruct(id, prompt, onStage, signal, options = {}) {
  const { job } = await api(
    'reconstruct',
    { id, prompt, mode: options.mode, requestId: crypto.randomUUID() },
    { signal },
  );
  options.onJob?.(job);
  return watchReconstruction(id, job.id, onStage, signal, options);
}
