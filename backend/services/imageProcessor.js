import sharp from "sharp";
import convert from "heic-convert";
import { convertHeicViaCli } from "../helpers/heicFallback.js";

const FULL_MAX_WIDTH = 1920;
const THUMB_MAX_WIDTH = 400;
const FULL_QUALITY = 80;
const THUMB_QUALITY = 70;
const HEIC_EXT = /\.(heic|heif)$/i;

async function prepareImageBuffer(buffer, fileName = "", mime = "") {
  const isHeic =
    HEIC_EXT.test(fileName || "") || /^image\/hei(c|f)/i.test(mime || "");

  if (!isHeic) {
    return buffer;
  }

  try {
    const jpeg = await convert({
      buffer,
      format: "JPEG",
      quality: 0.92,
    });
    return Buffer.from(jpeg);
  } catch (err) {
    const msg = err?.message || "";
    const needsCliFallback =
      /memory allocation|security limit|HEIF processing/i.test(msg);

    if (!needsCliFallback) {
      throw err;
    }

    return convertHeicViaCli(buffer);
  }
}

/**
 * Process an image buffer into optimized WebP variants for gallery use.
 * @param {Buffer} buffer - Raw image buffer
 * @param {string} [fileName] - Original file name (for HEIC detection)
 * @param {string} [mime] - Original MIME type
 * @returns {Promise<{ full: Buffer, thumbnail: Buffer }>}
 */
export async function processGalleryImage(buffer, fileName = "", mime = "") {
  const input = await prepareImageBuffer(buffer, fileName, mime);
  const pipeline = sharp(input, { failOn: "none" }).rotate();

  const metadata = await pipeline.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Invalid image file");
  }

  const full = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      width: FULL_MAX_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: FULL_QUALITY })
    .toBuffer();

  const thumbnail = await sharp(input, { failOn: "none" })
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
