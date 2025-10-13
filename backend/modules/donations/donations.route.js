import express from "express";
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createDonation,
  getCampaignDonations,
  getMyDonations,
  getDonationStats,
} from "./donations.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/campaigns", getAllCampaigns);
router.get("/campaigns/:id", getCampaignById);
router.get("/campaigns/:id/donations", getCampaignDonations);
router.get("/stats", getDonationStats);

// Protected routes
router.post("/donate", protect, createDonation);
router.get("/my-donations", protect, getMyDonations);

// Admin routes
router.post(
  "/campaigns",
  protect,
  restrictTo("admin", "moderator"),
  createCampaign
);
router.put(
  "/campaigns/:id",
  protect,
  restrictTo("admin", "moderator"),
  updateCampaign
);
router.delete("/campaigns/:id", protect, restrictTo("admin"), deleteCampaign);

export default router;
