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
import { protect, hasPermission, optionalProtect } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  createNewsSchema,
  updateNewsSchema,
  addCommentSchema,
} from "../../validators/news.validator.js";

const router = express.Router();

// Public routes
router.get("/", optionalProtect, getAllNews);
router.get("/latest", getLatestNews);
router.get("/:id", getNewsById);

// Protected routes
router.post(
  "/",
  protect,
  hasPermission(PERMISSIONS.NEWS_MANAGE),
  validate(createNewsSchema),
  createNews
);
router.put("/:id", protect, validate(updateNewsSchema), updateNews);
router.delete("/:id", protect, deleteNews);
router.post("/:id/like", protect, likeNews);
router.post("/:id/comments", protect, validate(addCommentSchema), addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

export default router;
