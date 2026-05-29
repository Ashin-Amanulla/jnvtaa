import express from "express";
import {
  getConversations,
  getConversationMessages,
  startConversation,
  sendMessage,
} from "./messages.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.post("/conversations", startConversation);
router.get("/conversations/:id/messages", getConversationMessages);
router.post("/conversations/:id/messages", sendMessage);

export default router;
