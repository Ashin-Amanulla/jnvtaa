/**
 * Convert a human-readable gallery name into an S3-safe folder slug.
 * e.g. "Sports Day 2026" -> "sports-day-2026"
 */
export function slugifyGalleryName(name) {
  if (!name || typeof name !== "string") {
    return "";
  }

  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
