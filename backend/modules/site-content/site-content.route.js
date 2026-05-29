import express from "express";
import {
  getContentByKey,
  getAllContent,
  upsertContent,
} from "./site-content.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";

const router = express.Router();

router.get("/", protect, hasPermission(PERMISSIONS.SITE_CONTENT_MANAGE), getAllContent);
router.get("/:key", getContentByKey);
router.put("/:key", protect, hasPermission(PERMISSIONS.SITE_CONTENT_MANAGE), upsertContent);

export default router;
