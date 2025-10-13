import express from "express";
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  likeNews,
  addComment,
  deleteComment,
  getLatestNews,
} from "./news.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllNews);
router.get("/latest", getLatestNews);
router.get("/:id", getNewsById);

// Protected routes
router.post("/", protect, restrictTo("admin", "moderator"), createNews);
router.put("/:id", protect, restrictTo("admin", "moderator"), updateNews);
router.delete("/:id", protect, restrictTo("admin", "moderator"), deleteNews);
router.post("/:id/like", protect, likeNews);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

export default router;
