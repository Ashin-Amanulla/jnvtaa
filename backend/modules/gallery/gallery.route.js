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
} from "./gallery.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllGalleryItems);
router.get("/:id", getGalleryItemById);

// Protected routes
router.post("/", protect, createGalleryItem);
router.put("/:id", protect, updateGalleryItem);
router.delete("/:id", protect, deleteGalleryItem);
router.post("/:id/like", protect, likeGalleryItem);
router.post("/:id/comments", protect, addComment);

// Admin routes
router.put(
  "/:id/approve",
  protect,
  restrictTo("admin", "moderator"),
  approveGalleryItem
);

export default router;
