import { spawn, execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile, open } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = path.join(root, 'work/local-live');
const stateFile = path.join(work, 'connection.json');
const envFile = path.join(work, 'worker.env');
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const readState = () =>
  readFile(stateFile, 'utf8')
    .then(JSON.parse)
    .catch(() => ({}));
const saveState = (state) =>
  writeFile(stateFile, JSON.stringify(state, null, 2), { mode: 0o600 });
function running(pid, marker) {
  if (!Number.isInteger(pid) || pid < 2) return false;
  try {
    return execFileSync('ps', ['-p', String(pid), '-o', 'command='], {
      encoding: 'utf8',
    }).includes(marker);
  } catch {
    return false;
  }
}
async function background(command, args, logfile, env) {
  const log = await open(path.join(work, logfile), 'a', 0o600);
  const child = spawn(command, args, {
    cwd: root,
    env,
    detached: true,
    stdio: ['ignore', log.fd, log.fd],
  });
  await new Promise((resolve, reject) => {
    child.once('spawn', resolve);
    child.once('error', reject);
  });
  child.unref();
  await log.close();
  return child.pid;
}
export async function startLocalWorker() {
  await mkdir(work, { recursive: true });
  const state = await readState();
  if (!running(state.workerPid, 'scripts/worker-server.mjs')) {
    const source = parseEnv(
      await readFile(path.join(root, '.env.local'), 'utf8'),
    );
    if (!source.NVIDIA_API_KEY)
      throw Error('Configure NVIDIA_API_KEY privately in .env.local first.');
    const old = parseEnv(await readFile(envFile, 'utf8').catch(() => ''));
    const profile = {
      NVIDIA_API_KEY: source.NVIDIA_API_KEY,
      FUSION_AI_PROVIDER: 'nvidia',
      FUSION_MODEL: 'moonshotai/kimi-k3',
      FUSION_MODEL_VISION: 'true',
      FUSION_ALLOW_PAID_MODELS: 'false',
      FUSION_STORAGE_BACKEND: 'local',
      FUSION_BROWSER_PROVIDER: 'local',
      FUSION_DATA_DIR: path.join(work, 'data'),
      FUSION_JOB_DIR: path.join(work, 'jobs'),
      FUSION_WORKER_SECRET:
        old.FUSION_WORKER_SECRET || randomBytes(32).toString('hex'),
      FUSION_WORKER_CONCURRENCY: '1',
      FUSION_WORKER_MAX_PENDING: '3',
      FUSION_DAILY_LIMIT: '15',
      FUSION_WORKER_HOST: '127.0.0.1',
      PORT: '3102',
      NODE_ENV: 'development',
    };
    await writeFile(
      envFile,
      Object.entries(profile)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join('\n') + '\n',
      { mode: 0o600 },
    );
    const env = { ...process.env };
    for (const key of Object.keys(env)) {
      if (
        /^(FUSION_|VERCEL|BLOB_|NVIDIA_|OPENAI_|OPENROUTER_|SILICONFLOW_|BROWSERBASE_|AI_GATEWAY_|NODE_ENV|PORT$)/.test(
          key,
        )
      )
        delete env[key];
    }
    state.workerPid = await background(
      process.execPath,
      [`--env-file=${envFile}`, 'scripts/worker-server.mjs'],
      'worker.log',
      env,
    );
    await saveState(state);
  }
  let ready = false;
  for (let n = 0; n < 90; n++) {
    try {
      ready = (
        await fetch('http://127.0.0.1:3102/healthz', {
          signal: AbortSignal.timeout(1000),
        })
      ).ok;
    } catch {
      /* starting */
    }
    if (ready) break;
    await pause(1000);
  }
  if (!ready)
    throw Error(
      'The local worker did not become ready. Check work/local-live/worker.log.',
    );
  if (!running(state.tunnelPid, 'cloudflared')) {
    await writeFile(path.join(work, 'tunnel.log'), '', { mode: 0o600 });
    await writeFile(path.join(work, 'tunnel.yml'), '{}\n');
    const binary =
      process.env.FUSION_CLOUDFLARED || '/opt/homebrew/bin/cloudflared';
    state.tunnelPid = await background(
      binary,
      [
        'tunnel',
        '--config',
        path.join(work, 'tunnel.yml'),
        '--no-autoupdate',
        '--url',
        'http://127.0.0.1:3102',
        '--protocol',
        'http2',
      ],
      'tunnel.log',
      process.env,
    );
    delete state.workerUrl;
    delete state.previewUrl;
    await saveState(state);
  }
  for (let n = 0; n < 60 && !state.workerUrl; n++) {
    const log = await readFile(path.join(work, 'tunnel.log'), 'utf8');
    state.workerUrl = log.match(
      /https:\/\/[a-z0-9-]+\.trycloudflare\.com/,
    )?.[0];
    if (!state.workerUrl) await pause(1000);
  }
  if (!state.workerUrl)
    throw Error(
      'The free tunnel did not connect. Check work/local-live/tunnel.log.',
    );
  await saveState(state);
  return state;
}
export async function stopLocalWorker() {
  const state = await readState();
  for (const [key, marker] of [
    ['tunnelPid', 'cloudflared'],
    ['workerPid', 'scripts/worker-server.mjs'],
  ]) {
    if (running(state[key], marker)) process.kill(state[key], 'SIGTERM');
  }
  for (
    let n = 0;
    n < 35 && running(state.workerPid, 'scripts/worker-server.mjs');
    n++
  )
    await pause(1000);
  if (running(state.workerPid, 'scripts/worker-server.mjs'))
    throw Error(
      'The worker is still finishing shutdown. Wait before starting it again.',
    );
  await saveState({
    stoppedAt: new Date().toISOString(),
    previewUrl: state.previewUrl,
  });
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const command = process.argv[2] || 'start';
  if (command === 'stop') {
    await stopLocalWorker();
    console.log('Stopped the local worker and free tunnel.');
  } else if (command === 'status') {
    const state = await readState();
    console.log(
      JSON.stringify(
        {
          workerRunning: running(state.workerPid, 'scripts/worker-server.mjs'),
          tunnelRunning: running(state.tunnelPid, 'cloudflared'),
          workerUrl: state.workerUrl,
          previewUrl: state.previewUrl,
        },
        null,
        2,
      ),
    );
  } else if (command === 'start')
    console.log(JSON.stringify(await startLocalWorker(), null, 2));
  else throw Error('Use start, status or stop.');
}
