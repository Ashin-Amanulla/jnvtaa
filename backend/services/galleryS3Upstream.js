import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for S3 gallery feed`);
  }
  return value;
}

function encodeS3Key(key) {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function parseFolderConfig() {
  const prefixes = (process.env.S3_FOLDER_PREFIXES || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const names = (process.env.S3_FOLDER_NAMES || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  return prefixes.map((prefix, index) => ({
    prefix,
    id: `folder-${index + 1}`,
    name: names[index] || prefix.replace(/\/$/, "") || "Album",
  }));
}

const DEFAULT_GALLERY_EXCLUDE_PREFIXES = ["avatars/", "uploads/"];

function normalizeGalleryPrefix(prefix) {
  const trimmed = prefix.trim().replace(/^\/+/, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function parseGalleryExcludePrefixes() {
  const fromEnv = (process.env.S3_GALLERY_EXCLUDE_PREFIXES || "")
    .split(",")
    .map(normalizeGalleryPrefix)
    .filter(Boolean);

  return fromEnv.length ? fromEnv : DEFAULT_GALLERY_EXCLUDE_PREFIXES;
}

function isExcludedGalleryKey(key, excludedPrefixes = parseGalleryExcludePrefixes()) {
  const normalized = key.toLowerCase();
  return excludedPrefixes.some((prefix) =>
    normalized.startsWith(prefix.toLowerCase()),
  );
}

function isExcludedGallerySlug(slug, excludedPrefixes = parseGalleryExcludePrefixes()) {
  return isExcludedGalleryKey(`${slug.replace(/\/$/, "")}/`, excludedPrefixes);
}

function assertGallerySlugAllowed(slug) {
  if (isExcludedGallerySlug(slug)) {
    throw new Error(`"${slug}" is reserved for uploads and is not a gallery album`);
  }
}

export { isExcludedGallerySlug, assertGallerySlugAllowed };

function inferFolderFromKey(key, configuredFolders) {
  const matched = configuredFolders.find((folder) => key.startsWith(folder.prefix));
  if (matched) return matched;

  const firstPart = key.split("/").filter(Boolean)[0];
  if (!firstPart) return { id: "root", name: "Album" };

  return {
    id: `folder-${firstPart.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`,
    name: firstPart,
  };
}

function toS3PublicUrl(bucket, region, key) {
  const baseUrl =
    process.env.S3_PUBLIC_BASE_URL ||
    `https://${bucket}.s3.${region}.amazonaws.com`;
  return `${baseUrl.replace(/\/$/, "")}/${encodeS3Key(key)}`;
}

function getS3ClientConfig() {
  const bucket = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || "ap-south-1";
  const accessKeyId = getRequiredEnv("AWS_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("AWS_SECRET_ACCESS_KEY");

  if (!bucket) {
    throw new Error("S3_BUCKET_NAME (or AWS_S3_BUCKET) is required");
  }

  return {
    bucket,
    region,
    client: new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

export function thumbKeyFromImageKey(key) {
  const parts = key.split("/");
  if (parts.length < 2) return null;
  const fileName = parts.pop();
  return `${parts.join("/")}/thumbs/${fileName}`;
}

function isImageKey(key) {
  const lower = key.toLowerCase();
  return (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif")
  );
}

function mapObjectToGalleryImage(object, bucket, region, slug) {
  const key = object.Key;
  const fileName = key.split("/").pop() || "Photo";
  const thumbKey = thumbKeyFromImageKey(key);

  return {
    key,
    url: toS3PublicUrl(bucket, region, key),
    thumbnailUrl: thumbKey
      ? toS3PublicUrl(bucket, region, thumbKey)
      : toS3PublicUrl(bucket, region, key),
    name: fileName,
    title: fileName.replace(/\.[^.]+$/, ""),
    size: object.Size,
    lastModified: object.LastModified,
    gallerySlug: slug,
  };
}

export async function listGalleryFolders() {
  const { bucket, region, client } = getS3ClientConfig();
  const excludedPrefixes = parseGalleryExcludePrefixes();
  const folderStats = new Map();
  let continuationToken;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents || []) {
      const key = object.Key;
      if (!key || key.endsWith("/") || key.includes("/thumbs/")) continue;
      if (!isImageKey(key)) continue;
      if (isExcludedGalleryKey(key, excludedPrefixes)) continue;

      const slug = key.split("/").filter(Boolean)[0];
      if (!slug || isExcludedGallerySlug(slug, excludedPrefixes)) continue;

      const existing = folderStats.get(slug) || {
        imageCount: 0,
        coverUrl: null,
        lastModified: null,
      };

      existing.imageCount += 1;
      if (
        !existing.coverUrl ||
        (object.LastModified &&
          (!existing.lastModified ||
            object.LastModified > existing.lastModified))
      ) {
        existing.coverUrl = toS3PublicUrl(bucket, region, key);
        existing.lastModified = object.LastModified;
      }

      folderStats.set(slug, existing);
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  const folders = [...folderStats.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, stats]) => ({
      id: `folder-${slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`,
      slug,
      name: slug,
      imageCount: stats.imageCount,
      coverUrl: stats.coverUrl,
      lastModified: stats.lastModified,
    }));

  return folders;
}

export async function listGalleryFolderImages(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error("Gallery slug is required");
  }

  assertGallerySlugAllowed(slug);

  const { bucket, region, client } = getS3ClientConfig();
  const prefix = `${slug.replace(/\/$/, "")}/`;
  const images = [];
  let continuationToken;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents || []) {
      const key = object.Key;
      if (!key || key.endsWith("/") || key.includes("/thumbs/")) continue;
      if (!isImageKey(key)) continue;

      images.push(mapObjectToGalleryImage(object, bucket, region, slug));
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  images.sort((a, b) => {
    const aTime = a.lastModified ? new Date(a.lastModified).getTime() : 0;
    const bTime = b.lastModified ? new Date(b.lastModified).getTime() : 0;
    return bTime - aTime;
  });

  return images;
}

export function validateGallerySlug(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error("Gallery slug is required");
  }

  const trimmed = slug.trim();
  if (!trimmed) {
    throw new Error("Gallery slug is required");
  }

  if (trimmed.includes("..") || trimmed.startsWith("/") || trimmed.endsWith("/")) {
    throw new Error("Invalid gallery slug");
  }

  return trimmed;
}

async function listAllObjectsUnderPrefix(client, bucket, prefix) {
  const objects = [];
  let continuationToken;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents || []) {
      if (object.Key && !object.Key.endsWith("/")) {
        objects.push(object);
      }
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return objects;
}

async function prefixHasObjects(client, bucket, prefix) {
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: 1,
    }),
  );

  return (response.Contents || []).some(
    (object) => object.Key && !object.Key.endsWith("/"),
  );
}

async function batchDeleteKeys(client, bucket, keys) {
  const deletedKeys = [];

  for (let i = 0; i < keys.length; i += 1000) {
    const chunk = keys.slice(i, i + 1000);
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: chunk.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    );
    deletedKeys.push(...chunk);
  }

  return deletedKeys;
}

export async function deleteGalleryFolder(slug) {
  const validSlug = validateGallerySlug(slug);
  assertGallerySlugAllowed(validSlug);
  const { bucket, client } = getS3ClientConfig();
  const prefix = `${validSlug}/`;
  const objects = await listAllObjectsUnderPrefix(client, bucket, prefix);

  if (!objects.length) {
    throw new Error("Gallery folder not found or is empty");
  }

  const keys = objects.map((object) => object.Key);
  const deletedKeys = await batchDeleteKeys(client, bucket, keys);

  return {
    slug: validSlug,
    deletedCount: deletedKeys.length,
    deletedKeys,
  };
}

export async function renameGalleryFolder(oldSlug, newSlug) {
  const validOldSlug = validateGallerySlug(oldSlug);
  const validNewSlug = validateGallerySlug(newSlug);
  assertGallerySlugAllowed(validOldSlug);
  assertGallerySlugAllowed(validNewSlug);

  if (validOldSlug === validNewSlug) {
    throw new Error("New gallery name must be different from the current name");
  }

  const { bucket, client } = getS3ClientConfig();
  const oldPrefix = `${validOldSlug}/`;
  const newPrefix = `${validNewSlug}/`;

  const collision = await prefixHasObjects(client, bucket, newPrefix);
  if (collision) {
    const error = new Error(`Gallery folder "${validNewSlug}" already exists`);
    error.code = "GALLERY_COLLISION";
    throw error;
  }

  const objects = await listAllObjectsUnderPrefix(client, bucket, oldPrefix);
  if (!objects.length) {
    throw new Error("Gallery folder not found or is empty");
  }

  const copyPairs = objects.map((object) => ({
    oldKey: object.Key,
    newKey: object.Key.replace(oldPrefix, newPrefix),
  }));

  for (const { oldKey, newKey } of copyPairs) {
    try {
      await client.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${encodeS3Key(oldKey)}`,
          Key: newKey,
        }),
      );
    } catch (err) {
      throw new Error(
        `Failed to copy "${oldKey}" to "${newKey}": ${err.message}`,
      );
    }
  }

  const oldKeys = copyPairs.map((pair) => pair.oldKey);
  await batchDeleteKeys(client, bucket, oldKeys);

  return {
    oldSlug: validOldSlug,
    newSlug: validNewSlug,
    movedCount: copyPairs.length,
  };
}

export async function deleteGalleryS3Image(key) {
  if (!key || typeof key !== "string") {
    throw new Error("Image key is required");
  }

  if (key.includes("..") || key.startsWith("/")) {
    throw new Error("Invalid image key");
  }

  if (isExcludedGalleryKey(key)) {
    throw new Error("This image belongs to a reserved upload folder");
  }

  const { bucket, client } = getS3ClientConfig();
  const keysToDelete = [key];
  const thumbKey = thumbKeyFromImageKey(key);
  if (thumbKey) keysToDelete.push(thumbKey);

  await Promise.all(
    keysToDelete.map((objectKey) =>
      client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: objectKey,
        }),
      ),
    ),
  );

  return { deletedKeys: keysToDelete };
}

export async function fetchUpstreamGalleryImages() {
  const { bucket, region, client } = getS3ClientConfig();
  const excludedPrefixes = parseGalleryExcludePrefixes();

  const configuredFolders = parseFolderConfig();
  const prefixes = configuredFolders.length
    ? configuredFolders.map((f) => f.prefix)
    : [""];

  const allImages = [];

  for (const prefix of prefixes) {
    let continuationToken;
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });
      const response = await client.send(command);
      const objects = response.Contents || [];

      for (const object of objects) {
        const key = object.Key;
        if (!key || key.endsWith("/")) continue;
        if (key.includes("/thumbs/")) continue;
        if (isExcludedGalleryKey(key, excludedPrefixes)) continue;

        const lower = key.toLowerCase();
        const isImage =
          lower.endsWith(".jpg") ||
          lower.endsWith(".jpeg") ||
          lower.endsWith(".png") ||
          lower.endsWith(".webp") ||
          lower.endsWith(".gif");
        if (!isImage) continue;

        const folder = inferFolderFromKey(key, configuredFolders);
        const fileName = key.split("/").pop() || "Photo";

        const thumbKey = thumbKeyFromImageKey(key);

        allImages.push({
          id: key,
          key,
          url: toS3PublicUrl(bucket, region, key),
          thumbnailUrl: thumbKey
            ? toS3PublicUrl(bucket, region, thumbKey)
            : toS3PublicUrl(bucket, region, key),
          name: fileName,
          folder: {
            id: folder.id,
            name: folder.name,
          },
        });
      }

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);
  }

  return {
    ok: true,
    json: async () => ({
      success: true,
      data: { allImages },
    }),
  };
}
