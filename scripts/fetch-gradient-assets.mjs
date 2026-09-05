// Preserve the CDN's browser image rendition instead of the indexed source PNG.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const names = [
  'Be2eOLzV4xVwCVXDiJq8fLpcY3c',
  'UIpX3PUgTgkNx4Bx5MgOQSfAI',
  'jz1bdnCwcbbxvnbRZhV8NBmY',
  'gUrIjZ2n8b2RrowJ0g1CbV3gUM',
  'JkhULV0WMfJliwLaAnpsCU8KBdk',
  'Ud9wQi3KMKw0DpXcfhAMSRvpsQo',
  'jLPVBIsLpIQ3tZJZiCCEC1Jz7Ow',
];
await mkdir('public/vendor/framer/gradients', { recursive: true });
const assets = {};
for (const name of names) {
  const original = `/vendor/framer/images/${name}.png`;
  const png = await readFile(`public${original}`);
  const width = png.readUInt32BE(16),
    height = png.readUInt32BE(20);
  const source = `https://framerusercontent.com/images/${name}.png?width=${width}&height=${height}`;
  const response = await fetch(source, {
    headers: { Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' },
  });
  if (!response.ok) throw new Error(`${response.status}: ${source}`);
  const type = response.headers.get('content-type');
  const extension =
    type === 'image/avif' ? 'avif' : type === 'image/webp' ? 'webp' : null;
  if (!extension) throw new Error(`Expected optimized image, received ${type}`);
  const local = `/vendor/framer/gradients/${name}.${extension}`;
  const body = Buffer.from(await response.arrayBuffer());
  await writeFile(`public${local}`, body);
  assets[original] = {
    local,
    source,
    width,
    height,
    bytes: body.length,
    sha256: createHash('sha256').update(body).digest('hex'),
    smooth: ![
      'Ud9wQi3KMKw0DpXcfhAMSRvpsQo',
      'jLPVBIsLpIQ3tZJZiCCEC1Jz7Ow',
    ].includes(name),
  };
  console.log(`${name}: ${body.length} bytes (${type})`);
}
await writeFile(
  'src/data/gradient-assets.json',
  JSON.stringify(assets, null, 2) + '\n',
);
