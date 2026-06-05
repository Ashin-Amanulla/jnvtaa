import multer from "multer";
import path from "path";
import { createHash } from "crypto";
import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import Gallery from "./gallery.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";
import {
  fetchUpstreamGalleryImages,
  listGalleryFolders,
  listGalleryFolderImages,
  deleteGalleryS3Image,
  renameGalleryFolder,
  deleteGalleryFolder,
} from "../../services/galleryS3Upstream.js";
import {
  canModifyResource,
  canViewUnpublished,
} from "../../helpers/authorization.js";
import { isStaff } from "../../config/roles.js";
import { slugifyGalleryName } from "../../helpers/gallerySlug.js";
import {
  processGalleryImage,
  isAllowedImageFile,
} from "../../services/imageProcessor.js";
import {
  uploadBufferToS3,
  s3ObjectExists,
} from "../../services/upload.service.js";

function contentHash(buffer) {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}

const galleryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 20,
  },
  fileFilter: (_req, file, cb) => {
    if (isAllowedImageFile(file.originalname, file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(
      new Error(
        "Only image files are allowed (jpg, png, webp, gif, heic, heif)",
      ),
    );
  },
});

export const galleryUploadMiddleware = galleryUpload.array("files", 20);

function sanitizeBaseName(fileName) {
  const ext = path.extname(fileName || "");
  const base = path.basename(fileName || "photo", ext);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "photo";
}

function parseUploadMetadata(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Public feed backed by direct S3 object listing.
 * Normalized to match the shape the Gallery page expects (items + folder filters).
 */
export const getS3MediaFeed = asyncHandler(async (req, res, next) => {
  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/e2bd3e24-2d80-4a40-98be-8c57fba7031d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2f488d'},body:JSON.stringify({sessionId:'2f488d',location:'gallery.controller.js:79',message:'getS3MediaFeed called',data:{origin:req.headers.origin||null,host:req.headers.host||null,env_cors:process.env.CORS_ORIGIN||null,env_bucket:process.env.S3_BUCKET_NAME||process.env.AWS_S3_BUCKET||null,env_region:process.env.AWS_REGION||null,has_aws_key:!!process.env.AWS_ACCESS_KEY_ID,has_aws_secret:!!process.env.AWS_SECRET_ACCESS_KEY,s3_public_base:process.env.S3_PUBLIC_BASE_URL||null},timestamp:Date.now(),hypothesisId:'A,B,C,D'})}).catch(()=>{});
  // #endregion
  let upstreamRes;
  try {
    upstreamRes = await fetchUpstreamGalleryImages();
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7249/ingest/e2bd3e24-2d80-4a40-98be-8c57fba7031d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2f488d'},body:JSON.stringify({sessionId:'2f488d',location:'gallery.controller.js:84',message:'fetchUpstreamGalleryImages THREW',data:{error:err.message,stack:err.stack?.slice(0,400)},timestamp:Date.now(),hypothesisId:'B,C'})}).catch(()=>{});
    // #endregion
    return next(new AppError(`Gallery S3 fetch failed: ${err.message}`, 502));
  }

  if (!upstreamRes.ok) {
    const text = await upstreamRes.text().catch(() => "");
    return next(
      new AppError(
        `Gallery S3 error (${upstreamRes.status}): ${text.slice(0, 200)}`,
        502,
      ),
    );
  }

  const body = await upstreamRes.json().catch(() => null);
  if (!body?.success || !body?.data) {
    return next(new AppError("Invalid gallery S3 response", 502));
  }

  const allImages = Array.isArray(body.data.allImages) ? body.data.allImages : [];

  const items = allImages.map((img, index) => {
    const key = img.key || img.id || `s3-${index}`;
    const id =
      typeof img.id === "string" && img.id.length
        ? img.id
        : String(key).replace(/[^a-zA-Z0-9-]/g, "-");

    return {
      _id: id,
      url: img.url,
      thumbnail: img.thumbnailLink || img.thumbnailUrl || img.url,
      title: img.name || "Photo",
      description: "",
      type: "image",
      folderId: img.folder?.id || "root",
      folderName: img.folder?.name || "Album",
      s3Key: img.key,
      source: "s3",
    };
  });

  const folderMap = new Map();
  for (const item of items) {
    if (!folderMap.has(item.folderId)) {
      folderMap.set(item.folderId, {
        id: item.folderId,
        name: item.folderName,
      });
    }
  }
  const folders = [...folderMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/e2bd3e24-2d80-4a40-98be-8c57fba7031d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2f488d'},body:JSON.stringify({sessionId:'2f488d',location:'gallery.controller.js:144',message:'getS3MediaFeed success',data:{itemCount:items.length,folderCount:folders.length,sampleUrl:items[0]?.url||null,sampleThumb:items[0]?.thumbnail||null},timestamp:Date.now(),hypothesisId:'B,C,E'})}).catch(()=>{});
  // #endregion

  sendSuccess(
    res,
    200,
    { items, folders, upstream: { totalImages: items.length } },
    "S3 gallery feed retrieved successfully",
  );
});

export const getGalleryFolders = asyncHandler(async (req, res, next) => {
  try {
    const folders = await listGalleryFolders();
    sendSuccess(res, 200, { folders }, "Gallery folders retrieved successfully");
  } catch (err) {
    return next(new AppError(`Gallery folders fetch failed: ${err.message}`, 502));
  }
});

export const getGalleryFolderImages = asyncHandler(async (req, res, next) => {
  const rawSlug = req.query.slug || req.params.slug || "";
  const slug = decodeURIComponent(String(rawSlug)).trim();

  if (!slug) {
    return next(new AppError("Gallery slug is required", 400));
  }

  try {
    const images = await listGalleryFolderImages(slug);
    sendSuccess(
      res,
      200,
      { slug, images, imageCount: images.length },
      "Gallery images retrieved successfully",
    );
  } catch (err) {
    return next(new AppError(`Gallery images fetch failed: ${err.message}`, 502));
  }
});

export const removeGalleryS3Image = asyncHandler(async (req, res, next) => {
  const key = (req.body.key || "").trim();

  if (!key) {
    return next(new AppError("Image key is required", 400));
  }

  try {
    const result = await deleteGalleryS3Image(key);
    sendSuccess(res, 200, result, "Gallery image deleted successfully");
  } catch (err) {
    return next(new AppError(`Gallery image delete failed: ${err.message}`, 502));
  }
});

export const renameGalleryFolderHandler = asyncHandler(async (req, res, next) => {
  const slug = decodeURIComponent(String(req.body.slug || "")).trim();
  const newName = String(req.body.newName || "").trim();
  const newSlug = slugifyGalleryName(newName);

  if (!slug) {
    return next(new AppError("Gallery slug is required", 400));
  }

  if (!newSlug) {
    return next(new AppError("A valid new gallery name is required", 400));
  }

  if (slug === newSlug) {
    return next(
      new AppError("New gallery name must produce a different folder", 400),
    );
  }

  try {
    const result = await renameGalleryFolder(slug, newSlug);
    sendSuccess(
      res,
      200,
      { ...result, newName },
      "Gallery renamed successfully",
    );
  } catch (err) {
    if (err.code === "GALLERY_COLLISION") {
      return next(new AppError(err.message, 409));
    }
    return next(new AppError(`Gallery rename failed: ${err.message}`, 502));
  }
});

export const removeGalleryFolder = asyncHandler(async (req, res, next) => {
  const slug = decodeURIComponent(String(req.body.slug || "")).trim();

  if (!slug) {
    return next(new AppError("Gallery slug is required", 400));
  }

  try {
    const result = await deleteGalleryFolder(slug);
    sendSuccess(res, 200, result, "Gallery deleted successfully");
  } catch (err) {
    return next(new AppError(`Gallery delete failed: ${err.message}`, 502));
  }
});

export const uploadGalleryImages = asyncHandler(async (req, res, next) => {
  const galleryName = (req.body.galleryName || "").trim();
  const exactSlug = (req.body.gallerySlug || "").trim();
  const slug = exactSlug || slugifyGalleryName(galleryName);

  if (!slug) {
    return next(new AppError("Gallery name is required", 400));
  }

  if (!req.files?.length) {
    return next(new AppError("At least one image file is required", 400));
  }

  const metadataList = parseUploadMetadata(req.body.metadata);
  const uploads = [];
  const errors = [];
  const skipped = [];

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const meta = metadataList[i] || {};

    try {
      const hash = contentHash(file.buffer);
      const baseName = sanitizeBaseName(meta.title || file.originalname);
      const uniqueName = `${hash}-${baseName}.webp`;
      const fullKey = `${slug}/${uniqueName}`;
      const thumbKey = `${slug}/thumbs/${uniqueName}`;

      const alreadyExists = await s3ObjectExists(fullKey);
      if (alreadyExists) {
        skipped.push({
          fileName: file.originalname,
          reason: "duplicate",
          key: fullKey,
        });
        // #region agent log
        fetch('http://127.0.0.1:7249/ingest/e2bd3e24-2d80-4a40-98be-8c57fba7031d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b2fc89'},body:JSON.stringify({sessionId:'b2fc89',location:'gallery.controller.js:upload-skip',message:'duplicate skipped',data:{fileName:file.originalname,fullKey,hash},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        continue;
      }

      const { full, thumbnail } = await processGalleryImage(
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      const fullResult = await uploadBufferToS3({
        buffer: full,
        fileName: uniqueName,
        contentType: "image/webp",
        folder: slug,
        key: fullKey,
      });

      const thumbResult = await uploadBufferToS3({
        buffer: thumbnail,
        fileName: uniqueName,
        contentType: "image/webp",
        folder: `${slug}/thumbs`,
        key: thumbKey,
      });

      uploads.push({
        key: fullResult.key,
        publicUrl: fullResult.publicUrl,
        thumbnailUrl: thumbResult.publicUrl,
        title: meta.title || baseName,
        description: meta.description || "",
        gallerySlug: slug,
        galleryName,
      });
      // #region agent log
      fetch('http://127.0.0.1:7249/ingest/e2bd3e24-2d80-4a40-98be-8c57fba7031d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b2fc89'},body:JSON.stringify({sessionId:'b2fc89',location:'gallery.controller.js:upload-ok',message:'file uploaded',data:{fileName:file.originalname,size:file.size,mime:file.mimetype,fullKey},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
    } catch (err) {
      errors.push({
        fileName: file.originalname,
        message: err.message || "Upload failed",
      });
      // #region agent log
      fetch('http://127.0.0.1:7249/ingest/e2bd3e24-2d80-4a40-98be-8c57fba7031d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b2fc89'},body:JSON.stringify({sessionId:'b2fc89',location:'gallery.controller.js:upload-fail',message:'file failed',data:{fileName:file.originalname,size:file.size,mime:file.mimetype,error:err.message},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
    }
  }

  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/e2bd3e24-2d80-4a40-98be-8c57fba7031d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b2fc89'},body:JSON.stringify({sessionId:'b2fc89',location:'gallery.controller.js:upload-summary',message:'batch complete',data:{total:req.files.length,uploaded:uploads.length,failed:errors.length,skipped:skipped.length,slug},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

  if (!uploads.length && !skipped.length) {
    return next(
      new AppError(
        errors[0]?.message || "All image uploads failed",
        422,
      ),
    );
  }

  const parts = [`${uploads.length} image(s) uploaded`];
  if (skipped.length) parts.push(`${skipped.length} duplicate(s) skipped`);
  if (errors.length) parts.push(`${errors.length} failed`);

  sendSuccess(
    res,
    201,
    {
      uploads,
      gallerySlug: slug,
      galleryName,
      uploadedCount: uploads.length,
      skippedCount: skipped.length,
      failedCount: errors.length,
      skipped: skipped.length ? skipped : undefined,
      errors: errors.length ? errors : undefined,
    },
    parts.join(", "),
  );
});

// Get all gallery items
export const getAllGalleryItems = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { category, type, batch, event, search } = req.query;

  // Build query
  const query = {};

  if (!canViewUnpublished(req, "gallery:manage")) {
    query.isPublished = true;
    query.isApproved = true;
  }

  if (category) query.category = category;
  if (type) query.type = type;
  if (batch) query.batch = batch;
  if (event) query.event = event;
  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
    ];
  }

  // Execute query
  const items = await Gallery.find(query)
    .populate("uploadedBy", "firstName lastName avatar")
    .populate("batch", "year name")
    .populate("event", "title date")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Gallery.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { items },
    pagination,
    "Gallery items retrieved successfully"
  );
});

// Get single gallery item
export const getGalleryItemById = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id)
    .populate("uploadedBy", "firstName lastName avatar batch")
    .populate("batch", "year name")
    .populate("event", "title date")
    .populate("comments.user", "firstName lastName avatar");

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  sendSuccess(res, 200, { item }, "Gallery item retrieved successfully");
});

// Create gallery item
export const createGalleryItem = asyncHandler(async (req, res) => {
  const itemData = {
    ...req.body,
    uploadedBy: req.user.id,
    isApproved: isStaff(req.user),
  };

  const item = await Gallery.create(itemData);
  await item.populate("uploadedBy", "firstName lastName avatar");

  sendSuccess(res, 201, { item }, "Gallery item created successfully");
});

// Update gallery item
export const updateGalleryItem = asyncHandler(async (req, res, next) => {
  let item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  // Check if user is uploader, admin, or moderator
  if (!canModifyResource(item.uploadedBy, req.user, "gallery:manage")) {
    return next(new AppError("Not authorized to update this item", 403));
  }

  item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("uploadedBy", "firstName lastName avatar");

  sendSuccess(res, 200, { item }, "Gallery item updated successfully");
});

// Delete gallery item
export const deleteGalleryItem = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  // Check if user is uploader, admin, or moderator
  if (!canModifyResource(item.uploadedBy, req.user, "gallery:manage")) {
    return next(new AppError("Not authorized to delete this item", 403));
  }

  await item.deleteOne();

  sendSuccess(res, 200, null, "Gallery item deleted successfully");
});

// Approve gallery item (Admin)
export const approveGalleryItem = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  item.isApproved = true;
  await item.save();

  sendSuccess(res, 200, { item }, "Gallery item approved successfully");
});

// Like gallery item
export const likeGalleryItem = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  // Check if already liked
  const alreadyLiked = item.likes.includes(req.user.id);

  if (alreadyLiked) {
    // Unlike
    item.likes = item.likes.filter((id) => id.toString() !== req.user.id);
  } else {
    // Like
    item.likes.push(req.user.id);
  }

  await item.save();

  sendSuccess(
    res,
    200,
    { item, isLiked: !alreadyLiked },
    "Like toggled successfully"
  );
});

// Add comment
export const addComment = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  const { content } = req.body;

  if (!content) {
    return next(new AppError("Comment content is required", 400));
  }

  item.comments.push({
    user: req.user.id,
    content,
  });

  await item.save();
  await item.populate("comments.user", "firstName lastName avatar");

  sendSuccess(res, 201, { item }, "Comment added successfully");
});
