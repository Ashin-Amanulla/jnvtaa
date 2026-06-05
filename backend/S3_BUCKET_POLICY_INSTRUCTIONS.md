# S3 Bucket Policy for Public Gallery Access

## Problem
Your S3 bucket `jnv-tvm` has "Block Public ACLs" enabled, which is AWS best practice. This means we cannot use object ACLs to make images public. Instead, we need a bucket policy.

## Solution: Add This Bucket Policy

Go to AWS S3 Console → `jnv-tvm` bucket → **Permissions** tab → **Bucket Policy** → Edit and add:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::jnv-tvm/*"
    }
  ]
}
```

This makes **all objects** in the bucket publicly readable via HTTPS.

## Alternative: Make Only Gallery Folders Public

If you want to restrict public access to only gallery folders (not other uploads), use:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGalleryImages",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::jnv-tvm/alumni-meet-2026/*",
        "arn:aws:s3:::jnv-tvm/ANWS CPR PROGRAM/*",
        "arn:aws:s3:::jnv-tvm/school-old-photos/*",
        "arn:aws:s3:::jnv-tvm/june-5th-2026/*",
        "arn:aws:s3:::jnv-tvm/*/*.jpg",
        "arn:aws:s3:::jnv-tvm/*/*.jpeg",
        "arn:aws:s3:::jnv-tvm/*/*.png",
        "arn:aws:s3:::jnv-tvm/*/*.webp",
        "arn:aws:s3:::jnv-tvm/*/*.gif"
      ]
    }
  ]
}
```

## Block Public Access Settings

Also check **Block Public Access** settings for the bucket:
- Go to **Permissions** → **Block public access (bucket settings)**
- Make sure "Block public access to buckets and objects granted through new public bucket policies" is **OFF**
- Keep "Block public access to buckets and objects granted through any access control lists (ACLs)" **ON** (current setting)

## Why This Works

- Bucket policy allows GetObject for everyone
- No individual object ACLs needed
- New uploads automatically inherit the bucket policy
- Old images become accessible immediately

## Test After Applying

After applying the bucket policy, test an old image URL like:
```
https://jnv-tvm.s3.ap-south-1.amazonaws.com/school-old-photos/DSC07701.JPG
```

It should load in your browser. Then refresh your gallery page - all images should appear.
