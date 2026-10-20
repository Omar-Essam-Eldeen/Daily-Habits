/**
 * Generates the PWA icons (192 + 512 + maskable 512 PNG) with zero
 * dependencies.
 *
 * v3.1 design — the app logo (see src/components/Logo.tsx): a sunrise over
 * a leaf whose vein is a check mark, on a golden-leaf gradient badge.
 * Drawn pixel-by-pixel here and encoded as PNG with the built-in zlib, so
 * `npm run icons` stays reproducible anywhere Node runs.
 *
 * Run with: npm run icons
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* ---------------- palette ---------------- */
const LEAF_5 = [87, 180, 60]; // #57b43c
const LEAF_6 = [47, 158, 68]; // #2f9e44
const LEAF_8 = [30, 108, 48]; // #1e6c30
const SUN = [255, 213, 79]; // #ffd54f
const SUN_DEEP = [255, 179, 0]; // #ffb300
const CREAM_A = [221, 242, 213]; // #ddf2d5 (leaf base)
const CREAM_B = [255, 248, 225]; // #fff8e1 (leaf tip)

const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const lerpColor = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
const blend = (base, over, alpha) => lerpColor(base, over, alpha);

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

/* Leaf as a lens: intersection of two circles whose centres sit either
   side of the tip-to-tip axis (unit space, mirrors Logo.tsx). */
const LEAF_A = [0.21, 0.68];
const LEAF_B = [0.69, 0.27];
const leafAxis = [LEAF_B[0] - LEAF_A[0], LEAF_B[1] - LEAF_A[1]];
const leafLen = Math.hypot(leafAxis[0], leafAxis[1]);
const leafDir = [leafAxis[0] / leafLen, leafAxis[1] / leafLen];
const leafPerp = [-leafDir[1], leafDir[0]];
const LEAF_OFF = 0.16;
const leafMid = [(LEAF_A[0] + LEAF_B[0]) / 2, (LEAF_A[1] + LEAF_B[1]) / 2];
const leafC1 = [leafMid[0] + leafPerp[0] * LEAF_OFF, leafMid[1] + leafPerp[1] * LEAF_OFF];
const leafC2 = [leafMid[0] - leafPerp[0] * LEAF_OFF, leafMid[1] - leafPerp[1] * LEAF_OFF];
const LEAF_R = Math.hypot(leafLen / 2, LEAF_OFF);

function insideLeaf(x, y) {
  return (
    Math.hypot(x - leafC1[0], y - leafC1[1]) <= LEAF_R &&
    Math.hypot(x - leafC2[0], y - leafC2[1]) <= LEAF_R
  );
}

const SUN_C = [0.7, 0.31];
const SUN_R = 0.125;
const CHECK = [
  [0.32, 0.63],
  [0.4375, 0.727],
  [0.648, 0.406],
];
const CHECK_HALF = 0.036;

function badgeGradient(x, y) {
  const t = Math.min(1, Math.max(0, (x + y) / 2));
  return t < 0.55 ? lerpColor(LEAF_5, LEAF_6, t / 0.55) : lerpColor(LEAF_6, LEAF_8, (t - 0.55) / 0.45);
}

function markColor(x, y, base) {
  let col = base;
  const dSun = Math.hypot(x - SUN_C[0], y - SUN_C[1]);
  /* sun halo */
  const halo = Math.max(0, 1 - dSun / 0.3);
  col = blend(col, SUN, halo * halo * 0.5);
  /* sun disc + rim */
  if (dSun <= SUN_R) col = SUN;
  else if (dSun <= SUN_R + 0.02) col = SUN_DEEP;
  /* leaf */
  if (insideLeaf(x, y)) {
    const proj = Math.min(
      1,
      Math.max(0, ((x - LEAF_A[0]) * leafDir[0] + (y - LEAF_A[1]) * leafDir[1]) / leafLen),
    );
    col = lerpColor(CREAM_A, CREAM_B, proj);
    /* the vein, drawn as a check — only inside the leaf */
    const dCheck = Math.min(
      distToSegment(x, y, CHECK[0][0], CHECK[0][1], CHECK[1][0], CHECK[1][1]),
      distToSegment(x, y, CHECK[1][0], CHECK[1][1], CHECK[2][0], CHECK[2][1]),
    );
    if (dCheck <= CHECK_HALF) col = LEAF_8;
  }
  return col;
}

function drawIcon(size, { maskable = false } = {}) {
  const data = Buffer.alloc(size * size * 4);
  const radius = size * 0.234;
  const markScale = maskable ? 0.8 : 1; // maskable: mark inside the safe zone

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      let alpha = 255;
      if (!maskable) {
        // Signed distance to the rounded-rect edge (negative = outside).
        const qx = Math.abs(x - (size - 1) / 2) - ((size - 1) / 2 - radius);
        const qy = Math.abs(y - (size - 1) / 2) - ((size - 1) / 2 - radius);
        const sd = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
        alpha = Math.round(Math.min(1, Math.max(0, 0.5 - sd / 1.6)) * 255);
        if (alpha === 0) continue;
      }
      const ux = (x + 0.5) / size;
      const uy = (y + 0.5) / size;
      // The badge gradient fills the canvas; the mark layers sample a
      // centre-scaled space so the maskable variant keeps its safe zone.
      const mx = 0.5 + (ux - 0.5) / markScale;
      const my = 0.5 + (uy - 0.5) / markScale;
      const col = markColor(mx, my, badgeGradient(ux, uy));
      data[i] = col[0];
      data[i + 1] = col[1];
      data[i + 2] = col[2];
      data[i + 3] = alpha;
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
const maskableFile = join(outDir, 'icon-maskable-512.png');
writeFileSync(maskableFile, drawIcon(512, { maskable: true }));
console.log(`wrote ${maskableFile}`);
