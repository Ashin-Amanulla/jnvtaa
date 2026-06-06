import "dotenv/config";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const THUMB_MAX_WIDTH = 400;
const THUMB_QUALITY = 70;

const bucket = process.env.S3_BUCKET_NAME;
const region = process.env.AWS_REGION || "ap-south-1";

if (!bucket || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error("Missing S3_BUCKET_NAME or AWS credentials in environment");
  process.exit(1);
}

const client = new S3Client({ region });

function isImageKey(key) {
  return /\.(jpe?g|png|webp|gif)$/i.test(key);
}

function thumbKeyFromImageKey(key) {
  const parts = key.split("/");
  if (parts.length < 2) return null;
  const fileName = parts.pop();
  return `${parts.join("/")}/thumbs/${fileName}`;
}

async function streamToBuffer(body) {
  const chunks = [];
  for await (const chunk of body) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function objectExists(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function listAllImages() {
  const images = [];
  let token;

  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: token,
      }),
    );

    for (const obj of res.Contents || []) {
      const key = obj.Key;
      if (!key || key.endsWith("/")) continue;
      if (key.includes("/thumbs/")) continue;
      if (!isImageKey(key)) continue;
      images.push(key);
    }

    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  return images;
}

function thumbOutputOptions(key) {
  if (/\.png$/i.test(key)) {
    return {
      pipeline: (img) => img.png({ quality: THUMB_QUALITY }),
      contentType: "image/png",
    };
  }

  if (/\.webp$/i.test(key)) {
    return {
      pipeline: (img) => img.webp({ quality: THUMB_QUALITY }),
      contentType: "image/webp",
    };
  }

  return {
    pipeline: (img) => img.jpeg({ quality: THUMB_QUALITY }),
    contentType: "image/jpeg",
  };
}

async function createThumb(sourceKey, thumbKey) {
  const getRes = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: sourceKey }),
  );
  const buffer = await streamToBuffer(getRes.Body);
  const { pipeline, contentType } = thumbOutputOptions(sourceKey);

  const thumbBuffer = await pipeline(
    sharp(buffer, { failOn: "none" })
      .rotate()
      .resize({
        width: THUMB_MAX_WIDTH,
        withoutEnlargement: true,
        fit: "inside",
      }),
  ).toBuffer();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: thumbKey,
      Body: thumbBuffer,
      ContentType: contentType,
    }),
  );
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  const prefix = args[0];
  const dryRun = process.argv.includes("--dry-run");

  const allKeys = await listAllImages();
  const keys = prefix
    ? allKeys.filter((k) => k.startsWith(`${prefix.replace(/\/$/, "")}/`))
    : allKeys;

  console.log(`Bucket: ${bucket}`);
  console.log(`Found ${keys.length} images${prefix ? ` in ${prefix}` : ""}`);
  if (dryRun) console.log("Dry run — no uploads");

  const concurrency = parseInt(process.env.THUMB_BACKFILL_CONCURRENCY, 10) || 8;
  let created = 0;
  let skipped = 0;
  let failed = 0;
  let processed = 0;

  async function processKey(key) {
    const thumbKey = thumbKeyFromImageKey(key);
    if (!thumbKey) return;

    if (await objectExists(thumbKey)) {
      skipped++;
      return;
    }

    if (dryRun) {
      console.log(`Would create: ${thumbKey}`);
      created++;
      return;
    }

    try {
      await createThumb(key, thumbKey);
      created++;
      processed++;
      if (processed % 25 === 0) {
        console.log(`Progress: ${processed} created so far (${created} total, ${skipped} skipped, ${failed} failed)`);
      }
    } catch (err) {
      failed++;
      console.error(`Failed ${key}: ${err.message}`);
    }
  }

  for (let i = 0; i < keys.length; i += concurrency) {
    const batch = keys.slice(i, i + concurrency);
    await Promise.all(batch.map((key) => processKey(key)));
  }

  console.log({ created, skipped, failed });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
