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
  if (provider === 'openrouter') {
    const selectedModel = model || 'minimax/minimax-m3:free';
    const freeOnly = process.env.FUSION_ALLOW_PAID_MODELS !== 'true';
    if (freeOnly && !selectedModel.endsWith(':free'))
      throw new ServiceError(
        'This workspace is configured for free models only. Select a free model.',
      );
    return {
      provider,
      model: selectedModel,
      key: process.env.OPENROUTER_API_KEY,
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      vision: process.env.FUSION_MODEL_VISION !== 'false',
      freeOnly,
    };
  }
  if (provider === 'nvidia')
    return {
      provider,
      model: model || 'moonshotai/kimi-k3',
      key: process.env.NVIDIA_API_KEY,
      endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
      vision: process.env.FUSION_MODEL_VISION !== 'false',
    };
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

export function generationTimeoutMs() {
  return !process.env.VERCEL && process.env.FUSION_AI_PROVIDER === 'nvidia'
    ? 600000
    : 270000;
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
  onProgress,
}) {
  const config = await credentials();
  if (!config.key || !config.model)
    throw new ServiceError(
      `${config.provider === 'siliconflow' ? 'SiliconFlow' : config.provider === 'openrouter' ? 'OpenRouter' : config.provider === 'nvidia' ? 'NVIDIA' : 'AI'} access is not configured. Add the server API key and select a model, then retry.`,
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
  let body;
  let data;
  const providerName = config.provider === 'nvidia' ? 'Kimi K3' : 'the model';
  const startedAt = Date.now();
  let currentStage = `Waiting for ${providerName} to respond`,
    receivedChars = 0;
  let lastUpdate = 0;
  const report = (stage, chars = receivedChars, force = false) => {
    const changed = stage !== currentStage;
    currentStage = stage;
    receivedChars = chars;
    if (!force && !changed && Date.now() - lastUpdate < 1000) return;
    lastUpdate = Date.now();
    onProgress?.({
      stage,
      progress: {
        receivedChars,
        elapsedSeconds: Math.floor((Date.now() - startedAt) / 1000),
        detail: receivedChars
          ? `${(receivedChars / 1024).toFixed(1)} KB of website code received`
          : 'No website code received yet',
      },
    });
  };
  report(currentStage, 0, true);
  const heartbeat = setInterval(
    () => report(currentStage, receivedChars, true),
    10000,
  );
  const timeout =
    config.provider === 'nvidia' && !process.env.VERCEL
      ? 480000
      : ['openrouter', 'nvidia'].includes(config.provider)
        ? 200000
        : 95000;
  try {
    response = await fetch(config.endpoint, {
      method: 'POST',
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(timeout)])
        : AbortSignal.timeout(timeout),
      headers: {
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        ...(config.provider === 'nvidia'
          ? { Accept: 'text/event-stream' }
          : {}),
      },
      body: JSON.stringify({
        ...(config.provider === 'openrouter'
          ? {
              provider: {
                require_parameters: true,
                ...(config.freeOnly
                  ? { max_price: { prompt: 0, completion: 0 } }
                  : {}),
              },
              reasoning: { enabled: false },
            }
          : {}),
        ...(config.provider === 'nvidia'
          ? { temperature: 1, reasoning_effort: 'low', stream: true }
          : {}),
        model: config.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content },
        ],
        response_format: { type: 'json_object' },
        max_tokens:
          config.provider === 'siliconflow'
            ? Math.min(maxTokens, 8000)
            : config.provider === 'nvidia'
              ? Math.min(maxTokens + 8000, 65536)
              : maxTokens,
        ...(config.provider === 'siliconflow' &&
        /^Qwen\/Qwen3-(?:8B|14B|32B)$/.test(config.model)
          ? { enable_thinking: false }
          : {}),
      }),
    });
    if (
      config.provider === 'nvidia' &&
      response.ok &&
      !response.headers.get('content-type')?.includes('application/json')
    ) {
      data = await readCompletionStream(
        response,
        ({ phase, receivedChars }) => {
          report(
            phase === 'code'
              ? 'Receiving website code'
              : `${providerName} is processing your request`,
            receivedChars,
          );
        },
      );
    } else body = await response.text();
  } catch (e) {
    if (e instanceof ServiceError) throw e;
    if (e.name === 'AbortError' && signal?.reason?.name !== 'TimeoutError')
      throw e;
    throw new ServiceError(
      'The model request timed out or lost its connection. Retry this step.',
    );
  } finally {
    clearInterval(heartbeat);
  }
  // Providers can return plain-text proxy errors as well as JSON.
  if (!data) {
    try {
      data = JSON.parse(body);
    } catch {
      data = {};
    }
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
    if (config.provider === 'openrouter' && response.status === 404)
      throw new ServiceError(
        'The selected free model currently has no available provider matching this request. Retry later or select another free model.',
      );
    if (config.provider === 'openrouter' && response.status === 403)
      throw new ServiceError(
        'OpenRouter denied this request. Check the account’s model access and data policy settings, then retry.',
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

// Read SSE as it arrives. Never forward the provider's private reasoning text.
export async function readCompletionStream(response, onProgress) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '',
    content = '',
    finishReason,
    streamDone = false;
  const incomplete = () =>
    new ServiceError(
      'The model returned an incomplete design. Your previous version is safe; retry generation.',
    );
  const consume = (line) => {
    line = line.trim();
    if (!line.startsWith('data:')) return;
    const payload = line.slice(5).trim();
    if (payload === '[DONE]') {
      streamDone = true;
      return;
    }
    if (!payload) return;
    let event;
    try {
      event = JSON.parse(payload);
    } catch {
      throw incomplete();
    }
    if (event.error) throw incomplete();
    const choice = event.choices?.[0];
    const delta = choice?.delta;
    if (delta?.content) {
      content += delta.content;
      onProgress?.({ phase: 'code', receivedChars: content.length });
    } else if (!content && (delta?.reasoning_content || delta?.reasoning)) {
      onProgress?.({ phase: 'processing', receivedChars: 0 });
    }
    finishReason = choice?.finish_reason || finishReason;
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let newline;
      while ((newline = buffer.indexOf('\n')) !== -1) {
        consume(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
        if (streamDone) break;
      }
      if (streamDone) break;
      if (done) {
        if (buffer.trim()) consume(buffer);
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  if (!finishReason) throw incomplete();
  return { choices: [{ message: { content }, finish_reason: finishReason }] };
}
