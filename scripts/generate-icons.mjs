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
 * else needs editing.
 *
 * Sources are centre-cropped to a square before resizing, never stretched, so
 * a non-square photo keeps the circular emblem's proportions. Keep the emblem
 * centred in whatever you drop in, and give it at least 512×512 of real
 * resolution — the script warns rather than silently shipping a soft icon.
 */
const root = path.resolve(import.meta.dirname, "..");
const p = (...parts) => path.join(root, ...parts);

const SOURCE = p("public/icons/orato-logo-source.png");

/** The largest icon we emit; a source below this has to be upscaled. */
const LARGEST_ICON = 512;

/** Fallback ground if the source has no texture to mirror outwards. */
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

async function loadSource() {
  try {
    await access(SOURCE);
  } catch {
    console.error(
      `Missing ${path.relative(root, SOURCE)}.\n` +
        `Put the Orato logo there (square, ${LARGEST_ICON}×${LARGEST_ICON} or larger) and re-run.`,
    );
    process.exit(1);
  }
  return readFile(SOURCE);
}

/** Centre-crop to the largest square the image contains. */
async function squared(buffer) {
  const { width, height } = await sharp(buffer).metadata();
  const side = Math.min(width, height);
  if (side < LARGEST_ICON) {
    console.warn(
      `! Source is ${width}×${height} — only ${side}px square. ` +
        `Icons up to ${LARGEST_ICON}px will be upscaled and look soft; ` +
        `supply a larger original when you have one.`,
    );
  }
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

/**
 * The safe-zone margin has to be invented: the emblem is a circle inscribed in
 * the source square, so its ring almost touches the edge and there is no
 * background inside the tile to feather into.
 *
 * A flat fill seams against the logo's diagonal sheen, and mirroring the edge
 * drags the ring itself into the margin. A heavily blurred copy of the source
 * keeps the sheen's direction and falloff, and dissolves the ring into a soft
 * halo that reads as a glow behind the coin.
 */
const ground = await sharp(square)
  .resize(maskSize, maskSize, { fit: "fill" })
  .blur(maskSize / 12)
  .toBuffer();

const emblem = await sharp(square).resize(inner, inner, { fit: "fill" }).png().toBuffer();
await sharp(ground)
  .composite([{ input: emblem, left: pad, top: pad }])
  .flatten({ background: WINE })
  .png()
  .toFile(p(maskRel));
console.log(`✓ ${maskRel} (${maskSize}×${maskSize}, maskable safe-zone)`);
