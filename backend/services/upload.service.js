import { randomUUID } from "crypto";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Config() {
  const bucket = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || "ap-south-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "S3 upload requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME"
    );
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

function encodeS3Key(key) {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export function toPublicUrl(bucket, region, key) {
  const baseUrl =
    process.env.S3_PUBLIC_BASE_URL ||
    `https://${bucket}.s3.${region}.amazonaws.com`;
  return `${baseUrl.replace(/\/$/, "")}/${encodeS3Key(key)}`;
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function createPresignedUploadUrl({
  fileName,
  contentType,
  folder = "uploads",
}) {
  const { bucket, region, client } = getS3Config();
  const ext = path.extname(fileName || "") || "";
  const base = sanitizeFileName(path.basename(fileName || "file", ext));
  const key = `${folder.replace(/\/$/, "")}/${Date.now()}-${randomUUID()}-${base}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });

  return {
    uploadUrl,
    key,
    publicUrl: toPublicUrl(bucket, region, key),
    expiresIn: 900,
  };
}

export async function uploadBufferToS3({
  buffer,
  fileName,
  contentType,
  folder = "uploads",
  key: customKey,
}) {
  const { bucket, region, client } = getS3Config();
  const ext = path.extname(fileName || "") || "";
  const base = sanitizeFileName(path.basename(fileName || "file", ext));
  const key =
    customKey ||
    `${folder.replace(/\/$/, "")}/${Date.now()}-${randomUUID()}-${base}${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
    })
  );

  return {
    key,
    publicUrl: toPublicUrl(bucket, region, key),
  };
}
