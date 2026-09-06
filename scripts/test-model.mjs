import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aiConfigured,
  modelConfig,
  modelJSON,
  generationTimeoutMs,
} from '../server/model.js';

const names = [
  'FUSION_AI_PROVIDER',
  'FUSION_MODEL',
  'FUSION_MODEL_VISION',
  'SILICONFLOW_API_KEY',
  'SILICONFLOW_BASE_URL',
  'AI_GATEWAY_API_KEY',
  'OPENROUTER_API_KEY',
  'NVIDIA_API_KEY',
  'VERCEL',
  'FUSION_ALLOW_PAID_MODELS',
];
async function isolated(run) {
  const saved = Object.fromEntries(
    names.map((name) => [name, process.env[name]]),
  );
  const fetch = globalThis.fetch;
  names.forEach((name) => delete process.env[name]);
  try {
    await run();
  } finally {
    globalThis.fetch = fetch;
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
}
const request = {
  system: 'Return JSON.',
  prompt: 'A studio site',
  images: ['data:image/jpeg;base64,example'],
};
function configure() {
  process.env.SILICONFLOW_API_KEY = 'test-key';
  process.env.FUSION_MODEL = 'Qwen/Qwen3-8B';
}

test('SiliconFlow is the default and never falls back to available paid credentials', () =>
  isolated(async () => {
    process.env.AI_GATEWAY_API_KEY = 'test-gateway-key';
    assert.equal(modelConfig().provider, 'siliconflow');
    assert.equal(await aiConfigured(), false);
    let calls = 0;
    globalThis.fetch = () => {
      calls++;
      throw Error('unexpected');
    };
    await assert.rejects(
      modelJSON(request),
      /SiliconFlow access is not configured/,
    );
    assert.equal(calls, 0);
  }));

test('SiliconFlow sends text evidence without images to a text model', () =>
  isolated(async () => {
    configure();
    assert.equal(await aiConfigured(), true);
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.siliconflow.com/v1/chat/completions');
      assert.equal(options.headers.Authorization, 'Bearer test-key');
      const body = JSON.parse(options.body);
      assert.equal(body.messages[1].content, request.prompt);
      assert.equal(body.enable_thinking, false);
      assert.equal(body.max_tokens, 8000);
      return Response.json({
        choices: [{ message: { content: '{"title":"Studio"}' } }],
      });
    };
    assert.equal((await modelJSON(request)).title, 'Studio');
  }));

test('Vision is opt-in and region uses the matching SiliconFlow endpoint', () =>
  isolated(async () => {
    configure();
    process.env.FUSION_MODEL_VISION = 'true';
    process.env.SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1/';
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.siliconflow.cn/v1/chat/completions');
      assert.equal(
        JSON.parse(options.body).messages[1].content[1].type,
        'image_url',
      );
      return Response.json({ choices: [{ message: { content: '{}' } }] });
    };
    await modelJSON(request);
    process.env.SILICONFLOW_BASE_URL = 'https://unexpected.example/v1';
    await assert.rejects(modelJSON(request), /API address is invalid/);
  }));

test('SiliconFlow flat errors and plain-text errors preserve actionable messages', () =>
  isolated(async () => {
    configure();
    for (const [status, body, pattern] of [
      [
        403,
        '{"code":30001,"message":"balance is not enough"}',
        /no remaining credit/,
      ],
      [401, 'Invalid token', /rejected the API key/],
      [429, '{"message":"TPM limit reached"}', /usage limit/],
      [502, 'Bad Gateway', /returned 502/],
    ]) {
      globalThis.fetch = async () => new Response(body, { status });
      await assert.rejects(modelJSON(request), pattern);
    }
  }));

test('Truncated or malformed model output cannot become a saved design', () =>
  isolated(async () => {
    configure();
    for (const choice of [
      { finish_reason: 'length', message: { content: '{}' } },
      { message: { content: 'not JSON' } },
    ]) {
      globalThis.fetch = async () => Response.json({ choices: [choice] });
      await assert.rejects(modelJSON(request), /incomplete design/);
    }
  }));

test('OpenRouter pins the free vision model and enforces zero-price routing', () =>
  isolated(async () => {
    process.env.FUSION_AI_PROVIDER = 'openrouter';
    process.env.OPENROUTER_API_KEY = 'test-router-key';
    assert.equal(await aiConfigured(), true);
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
      const body = JSON.parse(options.body);
      assert.equal(body.model, 'minimax/minimax-m3:free');
      assert.deepEqual(body.reasoning, { enabled: false });
      assert.deepEqual(body.provider.max_price, { prompt: 0, completion: 0 });
      assert.equal(body.provider.require_parameters, true);
      assert.equal(body.messages[1].content[1].type, 'image_url');
      assert.equal(body.models, undefined);
      return Response.json({
        choices: [{ message: { content: '{"title":"Studio"}' } }],
      });
    };
    assert.equal((await modelJSON(request)).title, 'Studio');
    process.env.FUSION_MODEL = 'minimax/minimax-m3';
    await assert.rejects(modelJSON(request), /free models only/);
  }));

test('Unavailable OpenRouter free endpoints return recovery guidance without fallback', () =>
  isolated(async () => {
    process.env.FUSION_AI_PROVIDER = 'openrouter';
    process.env.OPENROUTER_API_KEY = 'test-router-key';
    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return Response.json(
        { error: { message: 'No endpoints found' } },
        { status: 404 },
      );
    };
    await assert.rejects(modelJSON(request), /no available provider/);
    assert.equal(calls, 1);
  }));

test('A timeout while reading the provider response returns a retryable error', () =>
  isolated(async () => {
    process.env.FUSION_AI_PROVIDER = 'openrouter';
    process.env.OPENROUTER_API_KEY = 'test-router-key';
    globalThis.fetch = async () => ({
      text: async () => {
        throw new DOMException('Response deadline exceeded', 'TimeoutError');
      },
    });
    await assert.rejects(
      modelJSON(request),
      /timed out or lost its connection/,
    );
  }));

test('NVIDIA uses its hosted Kimi endpoint with vision and a reasoning budget', () =>
  isolated(async () => {
    process.env.FUSION_AI_PROVIDER = 'nvidia';
    process.env.NVIDIA_API_KEY = 'test-nvidia-key';
    assert.equal(await aiConfigured(), true);
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://integrate.api.nvidia.com/v1/chat/completions');
      assert.equal(options.headers.Authorization, 'Bearer test-nvidia-key');
      const body = JSON.parse(options.body);
      assert.equal(body.model, 'moonshotai/kimi-k3');
      assert.equal(body.reasoning_effort, 'low');
      assert.equal(body.temperature, 1);
      assert.equal(body.max_tokens, 20000);
      assert.equal(body.messages[1].content[1].type, 'image_url');
      assert.deepEqual(body.response_format, { type: 'json_object' });
      assert.equal(body.provider, undefined);
      assert.equal(body.reasoning, undefined);
      return Response.json({
        choices: [{ message: { content: '{"title":"Studio"}' } }],
      });
    };
    assert.equal((await modelJSON(request)).title, 'Studio');
    delete process.env.NVIDIA_API_KEY;
    await assert.rejects(modelJSON(request), /NVIDIA access is not configured/);
  }));

test('NVIDIA combines streamed content without reasoning and rejects interrupted output', () =>
  isolated(async () => {
    process.env.FUSION_AI_PROVIDER = 'nvidia';
    process.env.NVIDIA_API_KEY = 'test-nvidia-key';
    const events = [
      { choices: [{ delta: { reasoning_content: 'private reasoning' } }] },
      { choices: [{ delta: { content: '{"title":' } }] },
      { choices: [{ delta: { content: '"Studio"}' } }] },
      { choices: [{ delta: {}, finish_reason: 'stop' }] },
    ];
    globalThis.fetch = async (url, options) => {
      assert.equal(JSON.parse(options.body).stream, true);
      return new Response(
        events.map((e) => 'data: ' + JSON.stringify(e)).join('\n\n') +
          '\n\ndata: [DONE]',
      );
    };
    assert.deepEqual(await modelJSON(request), { title: 'Studio' });
    events.pop();
    await assert.rejects(modelJSON(request), /incomplete design/);
  }));

test('Kimi progress arrives before the stream closes and never includes reasoning text', () =>
  isolated(async () => {
    process.env.FUSION_AI_PROVIDER = 'nvidia';
    process.env.NVIDIA_API_KEY = 'test-nvidia-key';
    let controller, resolveProgress;
    const firstCode = new Promise((resolve) => {
      resolveProgress = resolve;
    });
    const events = [];
    let finished = false;
    const bytes = new TextEncoder();
    globalThis.fetch = async () =>
      new Response(
        new ReadableStream({
          start(c) {
            controller = c;
          },
        }),
        { headers: { 'Content-Type': 'text/event-stream' } },
      );
    const running = modelJSON({
      ...request,
      onProgress(event) {
        events.push(event);
        if (event.stage === 'Receiving website code') resolveProgress();
      },
    }).then((result) => {
      finished = true;
      return result;
    });
    // Allow credentials/fetch to initialize before supplying provider bytes.
    await new Promise((resolve) => setImmediate(resolve));
    const frame = (delta, finish_reason) =>
      'data: ' +
      JSON.stringify({ choices: [{ delta, finish_reason }] }) +
      '\r\n\r\n';
    const payload = bytes.encode(
      frame({ reasoning_content: 'DO_NOT_EXPOSE_THIS' }) +
        frame({ content: '{"title":"Café 🏡"}' }),
    );
    for (const byte of payload) controller.enqueue(Uint8Array.of(byte));
    await firstCode;
    assert.equal(finished, false, 'progress must not wait for response.text()');
    assert.ok(
      events.some((e) => e.stage === 'Kimi K3 is processing your request'),
    );
    assert.ok(events.some((e) => e.progress.receivedChars > 0));
    assert.ok(!JSON.stringify(events).includes('DO_NOT_EXPOSE_THIS'));
    controller.enqueue(bytes.encode(frame({}, 'stop') + 'data: [DONE]'));
    controller.close();
    assert.deepEqual(await running, { title: 'Café 🏡' });
  }));

test('Longer Kimi deadlines apply only to local trials', () =>
  isolated(async () => {
    process.env.FUSION_AI_PROVIDER = 'nvidia';
    assert.equal(generationTimeoutMs(), 600000);
    process.env.VERCEL = '1';
    assert.equal(generationTimeoutMs(), 270000);
    delete process.env.VERCEL;
    process.env.FUSION_AI_PROVIDER = 'openrouter';
    assert.equal(generationTimeoutMs(), 270000);
  }));

test(
  'An SSE completion marker finishes the request even when the connection stays open',
  { timeout: 2000 },
  () =>
    isolated(async () => {
      process.env.FUSION_AI_PROVIDER = 'nvidia';
      process.env.NVIDIA_API_KEY = 'test';
      let cancelled = false;
      globalThis.fetch = async () =>
        new Response(
          new ReadableStream({
            start(c) {
              c.enqueue(
                new TextEncoder().encode(
                  'data: ' +
                    JSON.stringify({
                      choices: [
                        {
                          delta: { content: '{"done":true}' },
                          finish_reason: 'stop',
                        },
                      ],
                    }) +
                    '\n\ndata: [DONE]\n\n',
                ),
              );
            },
            cancel() {
              cancelled = true;
            },
          }),
          { headers: { 'Content-Type': 'text/event-stream' } },
        );
      assert.deepEqual(await modelJSON(request), { done: true });
      assert.equal(cancelled, true);
    }),
);
