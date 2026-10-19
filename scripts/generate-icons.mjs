/**
 * Generates the PWA icons (192x192 and 512x512 PNG) with zero dependencies.
 *
 * Design: calm-green rounded square, a bold white check mark in the centre
 * (the universal "habit done" symbol). Pure Node: pixels are computed here
 * and encoded as PNG with the built-in zlib.
 *
 * Run with: npm run icons
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GREEN = [47, 158, 68]; // #2f9e44
const WHITE = [255, 255, 255];

/* ---------------- CRC32 (needed for PNG chunks) ---------------- */
const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (1 + width * 4);
    raw[rowStart] = 0; // filter: none
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------------- Drawing helpers ---------------- */
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  let t = l2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const x = x1 + t * dx;
  const y = y1 + t * dy;
  return Math.hypot(px - x, py - y);
}

function drawIcon(size) {
  const data = Buffer.alloc(size * size * 4);
  const radius = size * 0.22;
  const half = size / 2;
  // Check mark as two thick segments (in unit space, then scaled).
  const a = [0.30, 0.52];
  const b = [0.45, 0.68];
  const c = [0.72, 0.34];
  const stroke = size * 0.055;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      // Rounded-corner mask.
      const cx = Math.max(radius - x, x - (size - 1 - radius), 0);
      const cy = Math.max(radius - y, y - (size - 1 - radius), 0);
      const outside = Math.hypot(cx, cy) > radius && (cx > 0 || cy > 0);
      if (outside) {
        data[i + 3] = 0; // transparent outside corners
        continue;
      }
      const d1 = distToSegment(x, y, a[0] * size, a[1] * size, b[0] * size, b[1] * size);
      const d2 = distToSegment(x, y, b[0] * size, b[1] * size, c[0] * size, c[1] * size);
      const onCheck = Math.min(d1, d2) <= stroke;
      const [r, g, bl] = onCheck ? WHITE : GREEN;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = bl;
      data[i + 3] = 255;
      void half;
    }
  }
  return encodePng(size, size, data);
}

/* ---------------- Main ---------------- */
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });
for (const size of [192, 512]) {
  const file = join(outDir, `icon-${size}.png`);
  writeFileSync(file, drawIcon(size));
  console.log(`wrote ${file}`);
}
