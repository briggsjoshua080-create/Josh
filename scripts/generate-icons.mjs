import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Render public/orato-icon.svg to the PNG sizes the PWA manifest and iOS
 * home screen need. Run once after changing the SVG:
 *   node scripts/generate-icons.mjs
 * The SVG is full-bleed on its own charcoal background, so the same render
 * works for the maskable variant.
 */
const root = path.resolve(import.meta.dirname, "..");
const svg = await readFile(path.join(root, "public/orato-icon.svg"));

const targets = [
  ["orato-icon-180.png", 180],
  ["orato-icon-192.png", 192],
  ["orato-icon-512.png", 512],
  ["orato-icon-512-maskable.png", 512],
];

for (const [name, size] of targets) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(path.join(root, "public", name));
  console.log(`✓ public/${name} (${size}×${size})`);
}
