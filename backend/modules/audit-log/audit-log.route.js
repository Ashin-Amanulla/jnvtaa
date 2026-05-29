import express from "express";
import { getAuditLogs } from "./audit-log.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";

const router = express.Router();

router.get("/", protect, hasPermission(PERMISSIONS.AUDIT_LOG_READ), getAuditLogs);

export default router;
