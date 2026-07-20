import path from "node:path";
import sharp from "sharp";

/**
 * Regenerate the PWA / iOS icon PNGs from the master orator artwork,
 * public/orato-logo.png. Run once after replacing the logo:
 *   node scripts/generate-icons.mjs
 * The artwork is a full-bleed rounded emblem on its own wine ground, so the
 * same render serves the maskable variant.
 */
const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "public/orato-logo.png");

const targets = [
  ["orato-icon-180.png", 180],
  ["orato-icon-192.png", 192],
  ["orato-icon-512.png", 512],
  ["orato-icon-512-maskable.png", 512],
];

for (const [name, size] of targets) {
  await sharp(src)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(path.join(root, "public", name));
  console.log(`✓ public/${name} (${size}×${size})`);
}
