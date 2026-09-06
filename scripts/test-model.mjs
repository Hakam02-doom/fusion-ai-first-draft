import test from 'node:test';
import assert from 'node:assert/strict';
import { aiConfigured, modelConfig, modelJSON } from '../server/model.js';

const names = [
  'FUSION_AI_PROVIDER',
  'FUSION_MODEL',
  'FUSION_MODEL_VISION',
  'SILICONFLOW_API_KEY',
  'SILICONFLOW_BASE_URL',
  'AI_GATEWAY_API_KEY',
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
