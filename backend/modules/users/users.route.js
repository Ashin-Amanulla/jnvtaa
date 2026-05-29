import express from "express";
import {
  getAllUsers,
  getUserById,
  updateProfile,
  deleteAccount,
  verifyUser,
  getUnverifiedUsers,
  getUserStats,
  getAllUsersAdmin,
  updateUserRole,
  deactivateUser,
  adminUpdateUser,
} from "./users.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  updateUserRoleSchema,
  adminUpdateUserSchema,
} from "../../validators/users.validator.js";

const router = express.Router();

// Public routes
router.get("/", getAllUsers);
router.get("/stats", getUserStats);

// Admin routes (must be before /:id)
router.get(
  "/admin/all",
  protect,
  hasPermission(PERMISSIONS.USERS_READ),
  getAllUsersAdmin
);
router.get(
  "/admin/unverified",
  protect,
  hasPermission(PERMISSIONS.USERS_READ),
  getUnverifiedUsers
);
router.put(
  "/admin/verify/:id",
  protect,
  hasPermission(PERMISSIONS.USERS_VERIFY),
  verifyUser
);
router.put(
  "/admin/:id/role",
  protect,
  hasPermission(PERMISSIONS.USERS_ROLES),
  validate(updateUserRoleSchema),
  updateUserRole
);
router.put(
  "/admin/:id/deactivate",
  protect,
  hasPermission(PERMISSIONS.USERS_DEACTIVATE),
  deactivateUser
);
router.put(
  "/admin/:id",
  protect,
  hasPermission(PERMISSIONS.USERS_MANAGE),
  validate(adminUpdateUserSchema),
  adminUpdateUser
);

router.get("/:id", getUserById);

// Protected routes
router.put("/profile", protect, updateProfile);
router.delete("/account", protect, deleteAccount);

export default router;
