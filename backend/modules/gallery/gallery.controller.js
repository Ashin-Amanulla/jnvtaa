import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
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
} from "../../services/galleryS3Upstream.js";
import {
  canModifyResource,
  canViewUnpublished,
} from "../../helpers/authorization.js";
import { isStaff } from "../../config/roles.js";
import { slugifyGalleryName } from "../../helpers/gallerySlug.js";
import {
  processGalleryImage,
  isAllowedImageMime,
} from "../../services/imageProcessor.js";
import { uploadBufferToS3 } from "../../services/upload.service.js";

const galleryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 20,
  },
  fileFilter: (_req, file, cb) => {
    if (isAllowedImageMime(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed (jpg, png, webp, gif)"));
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
  let upstreamRes;
  try {
    upstreamRes = await fetchUpstreamGalleryImages();
  } catch (err) {
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

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const meta = metadataList[i] || {};

    try {
      const { full, thumbnail } = await processGalleryImage(file.buffer);
      const baseName = sanitizeBaseName(meta.title || file.originalname);
      const uniqueName = `${Date.now()}-${randomUUID()}-${baseName}.webp`;
      const fullKey = `${slug}/${uniqueName}`;
      const thumbKey = `${slug}/thumbs/${uniqueName}`;

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
    } catch (err) {
      errors.push({
        fileName: file.originalname,
        message: err.message || "Upload failed",
      });
    }
  }

  if (!uploads.length) {
    return next(
      new AppError(
        errors[0]?.message || "All image uploads failed",
        422,
      ),
    );
  }

  sendSuccess(
    res,
    201,
    {
      uploads,
      gallerySlug: slug,
      galleryName,
      uploadedCount: uploads.length,
      failedCount: errors.length,
      errors: errors.length ? errors : undefined,
    },
    `${uploads.length} image(s) uploaded successfully`,
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
