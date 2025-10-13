import express from "express";
import {
  getAllUsers,
  getUserById,
  updateProfile,
  deleteAccount,
  verifyUser,
  getUnverifiedUsers,
  getUserStats,
} from "./users.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllUsers);
router.get("/stats", getUserStats);
router.get("/:id", getUserById);

// Protected routes
router.put("/profile", protect, updateProfile);
router.delete("/account", protect, deleteAccount);

// Admin routes
router.get(
  "/admin/unverified",
  protect,
  restrictTo("admin", "moderator"),
  getUnverifiedUsers
);
router.put(
  "/admin/verify/:id",
  protect,
  restrictTo("admin", "moderator"),
  verifyUser
);

export default router;
