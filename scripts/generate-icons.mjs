import { access, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Generate every home-screen / favicon / PWA size from one source image.
 *
 *   npm run icons
 *
 * The source of truth is public/icons/orato-logo-source.png. To change the
 * logo, overwrite that single file with the new artwork and re-run — nothing
 * else needs editing. If it is missing (fresh checkout), it is rendered once
 * from public/icons/orato-emblem.svg at 1024×1024 first.
 *
 * Sources are centre-cropped to a square before resizing, never stretched, so
 * a non-square photo keeps the circular emblem's proportions. Keep the emblem
 * centred in whatever you drop in.
 */
const root = path.resolve(import.meta.dirname, "..");
const p = (...parts) => path.join(root, ...parts);

const SOURCE = p("public/icons/orato-logo-source.png");
const FALLBACK_SVG = p("public/icons/orato-emblem.svg");
const SOURCE_SIZE = 1024;

/** Wine ground, so any padding we add matches the emblem's own background. */
const WINE = { r: 0x4a, g: 0x14, b: 0x20 };

/** [output path relative to repo root, pixel size]. Square, all of them. */
const TARGETS = [
  ["public/icons/icon-512.png", 512],
  ["public/icons/icon-192.png", 192],
  ["public/icons/apple-touch-icon.png", 180],
  ["public/icons/apple-touch-icon-167.png", 167],
  ["public/icons/apple-touch-icon-152.png", 152],
  ["public/favicon-32.png", 32],
  ["public/favicon-16.png", 16],
];

/**
 * Android adaptive icons crop to a circle inscribed in ~80% of the canvas, so
 * the maskable variant sits the emblem inside a wine safe-zone margin.
 */
const MASKABLE = ["public/icons/icon-512-maskable.png", 512, 0.8];

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

/** Read the source PNG, creating it from the fallback SVG on first run. */
async function loadSource() {
  if (await exists(SOURCE)) return readFile(SOURCE);

  const svg = await readFile(FALLBACK_SVG);
  const png = await sharp(svg, { density: 384 }).resize(SOURCE_SIZE, SOURCE_SIZE).png().toBuffer();
  await sharp(png).toFile(SOURCE);
  console.log(`✓ public/icons/orato-logo-source.png (${SOURCE_SIZE}×${SOURCE_SIZE}, from orato-emblem.svg)`);
  return png;
}

/** Centre-crop to the largest square the image contains. */
async function squared(buffer) {
  const { width, height } = await sharp(buffer).metadata();
  const side = Math.min(width, height);
  return sharp(buffer)
    .extract({
      left: Math.round((width - side) / 2),
      top: Math.round((height - side) / 2),
      width: side,
      height: side,
    })
    .png()
    .toBuffer();
}

const square = await squared(await loadSource());

for (const [rel, size] of TARGETS) {
  await sharp(square).resize(size, size, { fit: "fill" }).png().toFile(p(rel));
  console.log(`✓ ${rel} (${size}×${size})`);
}

const [maskRel, maskSize, maskScale] = MASKABLE;
const inner = Math.round(maskSize * maskScale);
const pad = Math.round((maskSize - inner) / 2);
await sharp(square)
  .resize(inner, inner, { fit: "fill" })
  .extend({
    top: pad,
    bottom: maskSize - inner - pad,
    left: pad,
    right: maskSize - inner - pad,
    background: WINE,
  })
  .png()
  .toFile(p(maskRel));
console.log(`✓ ${maskRel} (${maskSize}×${maskSize}, maskable safe-zone)`);
