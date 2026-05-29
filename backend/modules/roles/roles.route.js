import express from "express";
import { getRoles } from "./roles.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";

const router = express.Router();

router.get(
  "/",
  protect,
  hasPermission(PERMISSIONS.USERS_ROLES),
  getRoles
);

export default router;
