import { createHash } from 'node:crypto';
import { readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

// Persist complete model responses before validating them. Validator fixes can resume without paying the provider latency again.
export function durableModel({ dir, callModel, onReuse = () => {} }) {
  return async (request) => {
    request.signal?.throwIfAborted();
    const key = createHash('sha256')
      .update(
        JSON.stringify({
          provider: process.env.FUSION_AI_PROVIDER,
          model: process.env.FUSION_MODEL,
          system: request.system,
          prompt: request.prompt,
          images: request.images,
          maxTokens: request.maxTokens,
        }),
      )
      .digest('hex');
    const file = path.join(dir, `model-response-${key}.json`);
    let cached;
    try {
      cached = JSON.parse(await readFile(file, 'utf8'));
    } catch {}
    if (cached) {
      await onReuse();
      return cached;
    }
    const response = await callModel(request);
    await writeFile(file + '.tmp', JSON.stringify(response), { mode: 0o600 });
    await rename(file + '.tmp', file);
    return response;
  };
}
