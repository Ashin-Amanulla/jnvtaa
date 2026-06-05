import sharp from "sharp";

const FULL_MAX_WIDTH = 1920;
const THUMB_MAX_WIDTH = 400;
const FULL_QUALITY = 80;
const THUMB_QUALITY = 70;

/**
 * Process an image buffer into optimized WebP variants for gallery use.
 * @param {Buffer} buffer - Raw image buffer
 * @returns {Promise<{ full: Buffer, thumbnail: Buffer }>}
 */
export async function processGalleryImage(buffer) {
  const pipeline = sharp(buffer, { failOn: "none" }).rotate();

  const metadata = await pipeline.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Invalid image file");
  }

  const full = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({
      width: FULL_MAX_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: FULL_QUALITY })
    .toBuffer();

  const thumbnail = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({
      width: THUMB_MAX_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: THUMB_QUALITY })
    .toBuffer();

  return { full, thumbnail };
}

export function isAllowedImageMime(mime) {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
  ];
  return allowed.includes((mime || "").toLowerCase());
}

export function isAllowedImageFile(fileName, mime) {
  if (isAllowedImageMime(mime)) return true;
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(fileName || "");
}
