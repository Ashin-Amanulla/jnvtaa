import express from "express";
import {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  addReplyNote,
} from "./contact-messages.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";

const router = express.Router();

router.post("/", createContactMessage);

router.get("/", protect, hasPermission(PERMISSIONS.CONTACT_MANAGE), getContactMessages);
router.get("/:id", protect, hasPermission(PERMISSIONS.CONTACT_MANAGE), getContactMessageById);
router.put(
  "/:id/status",
  protect,
  hasPermission(PERMISSIONS.CONTACT_MANAGE),
  updateContactMessageStatus
);
router.post(
  "/:id/reply-notes",
  protect,
  hasPermission(PERMISSIONS.CONTACT_MANAGE),
  addReplyNote
);

export default router;
