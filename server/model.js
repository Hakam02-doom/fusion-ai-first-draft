import { getVercelOidcToken } from '@vercel/oidc';

export class ServiceError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.status = status;
  }
}

// Provider selection is explicit: never spend on another provider as a fallback.
export function modelConfig() {
  const provider = process.env.FUSION_AI_PROVIDER || 'siliconflow';
  const model = process.env.FUSION_MODEL;
  if (provider === 'siliconflow') {
    const base = (
      process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.com/v1'
    ).replace(/\/$/, '');
    if (
      ![
        'https://api.siliconflow.com/v1',
        'https://api.siliconflow.cn/v1',
      ].includes(base)
    )
      throw new ServiceError(
        'SiliconFlow API address is invalid. Check server configuration.',
      );
    return {
      provider,
      model,
      key: process.env.SILICONFLOW_API_KEY,
      endpoint: `${base}/chat/completions`,
      vision: process.env.FUSION_MODEL_VISION === 'true',
    };
  }
  if (provider === 'openai')
    return {
      provider,
      model: model || 'gpt-4.1',
      key: process.env.OPENAI_API_KEY,
      endpoint: 'https://api.openai.com/v1/chat/completions',
      vision: true,
    };
  if (provider === 'vercel')
    return {
      provider,
      model: model || 'google/gemini-2.5-flash',
      key: process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
      endpoint: 'https://ai-gateway.vercel.sh/v1/chat/completions',
      vision: true,
    };
  throw new ServiceError(
    'The selected AI provider is not supported. Check server configuration.',
  );
}

async function credentials() {
  const config = modelConfig();
  if (config.provider === 'vercel' && !config.key)
    config.key = await getVercelOidcToken().catch(() => undefined);
  return config;
}
export async function aiConfigured() {
  try {
    const config = await credentials();
    return Boolean(config.key && config.model);
  } catch {
    return false;
  }
}

export async function modelJSON({
  system,
  prompt,
  images = [],
  signal,
  maxTokens = 12000,
}) {
  const config = await credentials();
  if (!config.key || !config.model)
    throw new ServiceError(
      `${config.provider === 'siliconflow' ? 'SiliconFlow' : 'AI'} access is not configured. Add the server API key and select a model, then retry.`,
    );
  const content = config.vision
    ? [
        { type: 'text', text: prompt },
        ...images
          .slice(0, 3)
          .map((url) => ({ type: 'image_url', image_url: { url } })),
      ]
    : prompt;
  let response;
  try {
    response = await fetch(config.endpoint, {
      method: 'POST',
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(95000)])
        : AbortSignal.timeout(95000),
      headers: {
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content },
        ],
        response_format: { type: 'json_object' },
        max_tokens:
          config.provider === 'siliconflow'
            ? Math.min(maxTokens, 8000)
            : maxTokens,
        ...(config.provider === 'siliconflow' &&
        /^Qwen\/Qwen3-(?:8B|14B|32B)$/.test(config.model)
          ? { enable_thinking: false }
          : {}),
      }),
    });
  } catch (e) {
    if (signal?.aborted || e.name === 'AbortError') throw e;
    throw new ServiceError(
      'The model request timed out or lost its connection. Retry this step.',
    );
  }
  // Providers can return plain-text proxy errors as well as JSON.
  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    data = {};
  }
  if (!response.ok) {
    const message = String(data.error?.message || data.message || body);
    if (
      response.status === 402 ||
      /credit card|payment|credit balance|insufficient|balance is not enough/i.test(
        message,
      )
    )
      throw new ServiceError(
        config.provider === 'vercel'
          ? 'Vercel AI Gateway needs billing enabled. Check your Vercel dashboard, then retry.'
          : 'The AI provider has no remaining credit for this model. Check your provider account or select an available free model, then retry.',
        402,
      );
    if (response.status === 401)
      throw new ServiceError(
        'The AI provider rejected the API key. Update the server API key, then retry.',
        503,
      );
    if (response.status === 429)
      throw new ServiceError(
        'The AI provider is busy or its usage limit was reached. Wait a moment and retry.',
        429,
      );
    throw new ServiceError(
      `AI provider returned ${response.status}. Check the model access and retry.`,
    );
  }
  const raw = data.choices?.[0]?.message?.content;
  try {
    if (data.choices?.[0]?.finish_reason === 'length')
      throw new Error('truncated');
    return JSON.parse(
      raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, ''),
    );
  } catch {
    throw new ServiceError(
      'The model returned an incomplete design. Your previous version is safe; retry generation.',
    );
  }
}
