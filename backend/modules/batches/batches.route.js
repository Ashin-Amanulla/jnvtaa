import express from "express";
import {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  addReunion,
} from "./batches.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";

const router = express.Router();

// Public routes
router.get("/", getAllBatches);
router.get("/:id", getBatchById);

// Admin routes
router.post("/", protect, hasPermission(PERMISSIONS.BATCHES_MANAGE), createBatch);
router.put("/:id", protect, hasPermission(PERMISSIONS.BATCHES_MANAGE), updateBatch);
router.delete(
  "/:id",
  protect,
  hasPermission(PERMISSIONS.BATCHES_DELETE),
  deleteBatch
);
router.post(
  "/:id/reunions",
  protect,
  hasPermission(PERMISSIONS.BATCHES_MANAGE),
  addReunion
);

export default router;
