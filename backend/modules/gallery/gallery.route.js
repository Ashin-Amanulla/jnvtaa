import express from "express";
import {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  approveGalleryItem,
  likeGalleryItem,
  addComment,
  getS3MediaFeed,
  getGalleryFolders,
  getGalleryFolderImages,
  removeGalleryS3Image,
  uploadGalleryImages,
  galleryUploadMiddleware,
} from "./gallery.controller.js";
import { protect, hasPermission, optionalProtect } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  createGallerySchema,
  updateGallerySchema,
  addCommentSchema,
} from "../../validators/gallery.validator.js";

const router = express.Router();

// Public routes — S3-backed feed (must be before "/:id")
router.get("/media/feed", getS3MediaFeed);

// Admin — S3 gallery folders + upload (must be before "/:id")
router.get(
  "/folders",
  protect,
  hasPermission(PERMISSIONS.GALLERY_MANAGE),
  getGalleryFolders,
);
router.get(
  "/folders/images",
  protect,
  hasPermission(PERMISSIONS.GALLERY_MANAGE),
  getGalleryFolderImages,
);
router.delete(
  "/s3/image",
  protect,
  hasPermission(PERMISSIONS.GALLERY_MANAGE),
  removeGalleryS3Image,
);
router.post(
  "/upload",
  protect,
  hasPermission(PERMISSIONS.GALLERY_MANAGE),
  galleryUploadMiddleware,
  uploadGalleryImages,
);

// Public routes — MongoDB gallery
router.get("/", optionalProtect, getAllGalleryItems);
router.get("/:id", getGalleryItemById);

// Protected routes
router.post("/", protect, validate(createGallerySchema), createGalleryItem);
router.put("/:id", protect, validate(updateGallerySchema), updateGalleryItem);
router.delete("/:id", protect, deleteGalleryItem);
router.post("/:id/like", protect, likeGalleryItem);
router.post("/:id/comments", protect, validate(addCommentSchema), addComment);

// Admin routes
router.put(
  "/:id/approve",
  protect,
  hasPermission(PERMISSIONS.GALLERY_MODERATE),
  approveGalleryItem
);

export default router;
