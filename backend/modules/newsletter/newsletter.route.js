import express from "express";
import {
  subscribe,
  confirmSubscription,
  getSubscribers,
  createCampaign,
  sendCampaign,
} from "./newsletter.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";

const router = express.Router();

router.post("/subscribe", subscribe);
router.get("/confirm/:token", confirmSubscription);

router.get(
  "/subscribers",
  protect,
  hasPermission(PERMISSIONS.NEWSLETTER_MANAGE),
  getSubscribers
);
router.post(
  "/campaigns",
  protect,
  hasPermission(PERMISSIONS.NEWSLETTER_MANAGE),
  createCampaign
);
router.post(
  "/campaigns/:id/send",
  protect,
  hasPermission(PERMISSIONS.NEWSLETTER_MANAGE),
  sendCampaign
);

export default router;
