/**
 * Fix S3 ACL permissions for existing gallery images
 * Run with: node helpers/fixGalleryS3Permissions.js
 */

import {
  S3Client,
  ListObjectsV2Command,
  PutObjectAclCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

function getS3Config() {
  const bucket = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || "ap-south-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing S3 configuration in .env");
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

async function listAllGalleryObjects(client, bucket) {
  const objects = [];
  let continuationToken;

  console.log("📋 Listing all gallery objects...");

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents || []) {
      const key = object.Key;
      if (!key || key.endsWith("/")) continue;

      const lower = key.toLowerCase();
      const isImage =
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".png") ||
        lower.endsWith(".webp") ||
        lower.endsWith(".gif");

      if (isImage) {
        objects.push(key);
      }
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return objects;
}

async function setPublicReadAcl(client, bucket, keys) {
  let successCount = 0;
  let errorCount = 0;

  console.log(`\n🔧 Setting public-read ACL on ${keys.length} images...\n`);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      await client.send(
        new PutObjectAclCommand({
          Bucket: bucket,
          Key: key,
          ACL: "public-read",
        }),
      );
      successCount++;
      if ((i + 1) % 50 === 0) {
        console.log(`  ✓ Processed ${i + 1}/${keys.length}...`);
      }
    } catch (err) {
      errorCount++;
      console.error(`  ✗ Failed to set ACL for ${key}: ${err.message}`);
    }
  }

  return { successCount, errorCount };
}

async function main() {
  console.log("🚀 Starting S3 Gallery Permissions Fix\n");
  console.log("This will set ACL='public-read' on all gallery images.\n");

  const { bucket, client } = getS3Config();

  console.log(`📦 Bucket: ${bucket}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION || "ap-south-1"}\n`);

  const keys = await listAllGalleryObjects(client, bucket);
  console.log(`✓ Found ${keys.length} gallery images\n`);

  if (keys.length === 0) {
    console.log("No images found. Exiting.");
    return;
  }

  // Check for --yes flag for non-interactive mode
  const autoYes = process.argv.includes("--yes") || process.argv.includes("-y");

  if (autoYes) {
    console.log("Running in non-interactive mode (--yes flag detected)\n");
    const { successCount, errorCount } = await setPublicReadAcl(
      client,
      bucket,
      keys,
    );

    console.log("\n✅ Done!");
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log("\n⚠️  Some files failed. Check error messages above.");
    }
    return;
  }

  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    `Continue and update ACL for ${keys.length} images? (yes/no): `,
    async (answer) => {
      rl.close();

      if (answer.toLowerCase() !== "yes") {
        console.log("\n❌ Aborted by user.");
        return;
      }

      const { successCount, errorCount } = await setPublicReadAcl(
        client,
        bucket,
        keys,
      );

      console.log("\n✅ Done!");
      console.log(`   Success: ${successCount}`);
      console.log(`   Errors: ${errorCount}`);

      if (errorCount > 0) {
        console.log(
          "\n⚠️  Some files failed. Check error messages above.",
        );
      }
    },
  );
}

main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
