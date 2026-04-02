/**
 * Fetches the public S3-backed gallery JSON from the deployed jnvta-2026 API
 * (same shape as GET /gallery/images there). No AWS credentials required on jnvtaa.
 */
const DEFAULT_UPSTREAM_BASE = "https://jnvtaa.in/api/api";

export function getGalleryS3ApiBase() {
  const raw = process.env.GALLERY_S3_API_BASE || DEFAULT_UPSTREAM_BASE;
  return raw.replace(/\/$/, "");
}

export async function fetchUpstreamGalleryImages() {
  const base = getGalleryS3ApiBase();
  const url = `${base}/gallery/images`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    return response;
  } finally {
    clearTimeout(t);
  }
}
