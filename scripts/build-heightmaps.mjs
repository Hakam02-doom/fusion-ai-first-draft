// Reproduce the reference logo shader's height field at build time.
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const images = [
  'B8Gfzp2iuX3zr0hXqzy5CKPjWow',
  'DMDrlJx19k76saWIxeHXyFGBn4',
  'utuTAvbP481llxleiQFekeSGvuY',
  'Ru9ycpUwuwhRPUw54J9a6ZuS9I',
  '9CdEGBm2kDCgfWOVbtiVOukk1nE',
];
function resize(data, sw, sh, dw, dh) {
  const out = new Uint8Array(dw * dh * 4);
  for (let y = 0; y < dh; y++)
    for (let x = 0; x < dw; x++) {
      const fx = Math.max(0, Math.min(sw - 1, ((x + 0.5) * sw) / dw - 0.5)),
        fy = Math.max(0, Math.min(sh - 1, ((y + 0.5) * sh) / dh - 0.5));
      const x0 = Math.floor(fx),
        y0 = Math.floor(fy),
        x1 = Math.min(x0 + 1, sw - 1),
        y1 = Math.min(y0 + 1, sh - 1),
        ax = fx - x0,
        ay = fy - y0;
      for (let c = 0; c < 4; c++)
        out[(y * dw + x) * 4 + c] = Math.round(
          (data[(y0 * sw + x0) * 4 + c] * (1 - ax) +
            data[(y0 * sw + x1) * 4 + c] * ax) *
            (1 - ay) +
            (data[(y1 * sw + x0) * 4 + c] * (1 - ax) +
              data[(y1 * sw + x1) * 4 + c] * ax) *
              ay,
        );
    }
  return out;
}
mkdirSync('public/vendor/heightmaps', { recursive: true });
for (const name of images) {
  const png = PNG.sync.read(
    readFileSync(`public/vendor/framer/images/${name}.png`),
  );
  let scale = 1024 / Math.min(png.width, png.height);
  scale *= Math.min(
    1,
    Math.sqrt(1024 ** 2 / (png.width * png.height * scale ** 2)),
  );
  const w = Math.round(png.width * scale),
    h = Math.round(png.height * scale),
    pixels = resize(png.data, png.width, png.height, w, h),
    mask = new Uint8Array(w * h),
    field = new Float32Array(w * h),
    groups = [[], []];
  for (let i = 0; i < mask.length; i++) mask[i] = pixels[i * 4 + 3] > 0 ? 1 : 0;
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (
        mask[i] &&
        [-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1].every((d) => mask[i + d])
      )
        groups[(x + y) % 2].push(i);
    }
  for (let iteration = 0; iteration < 50; iteration++)
    for (const group of groups)
      for (const i of group)
        field[i] =
          -0.95 * field[i] +
          0.4875 *
            (0.01 + field[i - w] + field[i + w] + field[i - 1] + field[i + 1]);
  let max = 0;
  for (const v of field) max = Math.max(max, v);
  const result = new Uint8Array(w * h * 4);
  for (let i = 0; i < mask.length; i++) {
    result[i * 4] = Math.round((field[i] / max) * 255);
    result[i * 4 + 1] = 255 - pixels[i * 4 + 3];
    result[i * 4 + 2] = mask[i] * 255;
    result[i * 4 + 3] = 255;
  }
  const output = new PNG({ width: png.width, height: png.height });
  output.data = Buffer.from(resize(result, w, h, png.width, png.height));
  writeFileSync(`public/vendor/heightmaps/${name}.png`, PNG.sync.write(output));
  console.log(`Generated ${name} (${png.width} × ${png.height})`);
}
