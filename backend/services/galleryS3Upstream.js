import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

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

export async function fetchUpstreamGalleryImages() {
  const bucket = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || "ap-south-1";
  const accessKeyId = getRequiredEnv("AWS_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("AWS_SECRET_ACCESS_KEY");

  if (!bucket) {
    throw new Error("S3_BUCKET_NAME (or AWS_S3_BUCKET) is required");
  }

  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

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

        allImages.push({
          id: key,
          key,
          url: toS3PublicUrl(bucket, region, key),
          thumbnailUrl: toS3PublicUrl(bucket, region, key),
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
