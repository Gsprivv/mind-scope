import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "icons");
const sourcePath = join(outDir, "icon-source.png");
const svgPath = join(outDir, "icon.svg");

mkdirSync(outDir, { recursive: true });

/** Square crop after trim — drops corner watermark on padded exports. */
async function loadSquareIcon() {
  if (existsSync(sourcePath)) {
    const trimmedBuffer = await sharp(sourcePath).trim({ threshold: 20 }).toBuffer();
    const { width, height } = await sharp(trimmedBuffer).metadata();
    const side = Math.min(width ?? 0, height ?? 0);
    const left = Math.floor(((width ?? side) - side) / 2);
    const top = Math.floor(((height ?? side) - side) / 2);
    return sharp(trimmedBuffer).extract({
      left,
      top,
      width: side,
      height: side,
    });
  }

  if (existsSync(svgPath)) {
    return sharp(svgPath);
  }

  throw new Error(
    "Add public/icons/icon-source.png (1024×1024 PNG) or icon.svg"
  );
}

const icon = await loadSquareIcon();

const sizes = [180, 192, 512];
for (const size of sizes) {
  await icon.clone().resize(size, size).png().toFile(join(outDir, `icon-${size}.png`));
  console.log(`Created icon-${size}.png`);
}

/** Maskable icon: icon inset on solid background for Android safe zone. */
const maskSize = 512;
const inset = Math.round(maskSize * 0.82);
const { data, info } = await icon
  .clone()
  .resize(inset, inset)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const background = { r: 59, g: 130, b: 246, alpha: 255 };
await sharp({
  create: {
    width: maskSize,
    height: maskSize,
    channels: 4,
    background,
  },
})
  .composite([
    {
      input: data,
      raw: { width: info.width, height: info.height, channels: info.channels },
      left: Math.floor((maskSize - inset) / 2),
      top: Math.floor((maskSize - inset) / 2),
    },
  ])
  .png()
  .toFile(join(outDir, "icon-maskable-512.png"));
console.log("Created icon-maskable-512.png");

await icon.clone().resize(32, 32).png().toFile(join(root, "public", "favicon.png"));
console.log("Created favicon.png");
