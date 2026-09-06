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
  if (!r.ok || data.error) throw new Error(data.error || 'Request failed.');
  return data;
}
export async function generate(
  id,
  prompt,
  onStage,
  signal,
  { redesign = false } = {},
) {
  const r = await fetch('/api/builder?action=generate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${workspaceKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      prompt,
      requestId: crypto.randomUUID(),
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
    result;
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
      if (event.result) result = event.result;
    }
    if (done) break;
  }
  if (!result)
    throw new Error(
      'The connection ended before generation finished. Reload the project to check its saved version.',
    );
  return result;
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
