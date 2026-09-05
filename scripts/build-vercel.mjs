import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist-vercel');
const source = path.join(root, 'reference/pages');
const manifest = JSON.parse(await readFile(path.join(root, 'reference/manifest.json'), 'utf8'));

// Fail the build before publishing a capture with missing local assets.
for (const asset of manifest.assets) {
  const file = path.join(root, 'public', asset.local.replace(/^\//, ''));
  if (!(await stat(file)).isFile()) throw new Error(`Missing asset: ${asset.local}`);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'public'), output, { recursive: true });

let count = 0;
for (const file of await readdir(source)) {
  if (!file.endsWith('.html')) continue;
  const destination = path.join(output, file.replaceAll('__', '/'));
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(source, file), destination);
  count++;
}

// Review copy: keep it out of search results, consistent with the Sites route.
await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`Built ${count} pages and ${manifest.assets.length} captured assets for Vercel.`);
