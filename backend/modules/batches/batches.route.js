import express from "express";
import {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  addReunion,
} from "./batches.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllBatches);
router.get("/:id", getBatchById);

// Admin routes
router.post("/", protect, restrictTo("admin", "moderator"), createBatch);
router.put("/:id", protect, restrictTo("admin", "moderator"), updateBatch);
router.delete("/:id", protect, restrictTo("admin"), deleteBatch);
router.post(
  "/:id/reunions",
  protect,
  restrictTo("admin", "moderator"),
  addReunion
);

export default router;
