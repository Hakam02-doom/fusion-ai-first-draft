import { spawn, execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { startLocalWorker } from './local-live-worker.mjs';

const state = await startLocalWorker();
if (state.previewUrl && !process.argv.includes('--redeploy')) {
  console.log(`Live testing is ready: ${state.previewUrl}/dashboard`);
  process.exit(0);
}
const profile = parseEnv(await readFile('work/local-live/worker.env', 'utf8'));
function vercel(args, input = '') {
  return new Promise((resolve, reject) => {
    const command = process.env.FUSION_VERCEL_CLI ? process.execPath : 'npx';
    const prefix = process.env.FUSION_VERCEL_CLI
      ? [process.env.FUSION_VERCEL_CLI]
      : ['--yes', 'vercel@59.11.7'];
    const child = spawn(command, [...prefix, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (data) => {
      output += data;
    });
    child.stderr.on('data', (data) => {
      output += data;
    });
    child.stdin.end(input);
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0
        ? resolve(output)
        : reject(
            Error(
              'Vercel preview setup failed. Check your Vercel login and project access. No production deployment was requested.',
            ),
          ),
    );
  });
}
// Restrict all settings to this test branch; send secrets through stdin, never arguments.
const branch = 'codex/hosted-browser-worker';
if (
  execFileSync('git', ['branch', '--show-current'], {
    encoding: 'utf8',
  }).trim() !== branch
)
  throw Error(`Switch to ${branch} before connecting the test preview.`);
for (const [key, value] of Object.entries({
  FUSION_WORKER_URL: state.workerUrl,
  FUSION_WORKER_SECRET: profile.FUSION_WORKER_SECRET,
  FUSION_STORAGE_BACKEND: 'worker',
})) {
  await vercel(['env', 'add', key, 'preview', branch, '--force'], value);
}
console.log('Connecting a preview deployment to your local worker…');
const output = await vercel(['deploy', '--yes', '--target=preview']);
const urls = output.match(
  /https:\/\/fusion-ai-first-draft-[a-z0-9]+-hakams-projects-a6d8ca99\.vercel\.app/g,
);
if (!urls?.length)
  throw Error(
    'Deployment returned no preview URL. Inspect the Vercel project before retrying.',
  );
state.deploymentUrl = urls.at(-1);
const alias =
  'fusion-ai-first-draft-git-codex-440b5f-hakams-projects-a6d8ca99.vercel.app';
await vercel(['alias', 'set', state.deploymentUrl, alias]);
state.previewUrl = `https://${alias}`;
await writeFile(
  'work/local-live/connection.json',
  JSON.stringify(state, null, 2),
  { mode: 0o600 },
);
console.log(`Live testing is ready: ${state.previewUrl}/dashboard`);
