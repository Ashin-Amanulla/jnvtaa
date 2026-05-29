import express from "express";
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createDonation,
  createOrder,
  verifyPayment,
  getDonationReceipt,
  getAllDonationsAdmin,
  getCampaignDonations,
  getMyDonations,
  getDonationStats,
} from "./donations.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  createOrderSchema,
  verifyPaymentSchema,
} from "../../validators/donations.validator.js";

const router = express.Router();

// Public routes
router.get("/campaigns", getAllCampaigns);
router.get("/campaigns/:id", getCampaignById);
router.get("/campaigns/:id/donations", getCampaignDonations);
router.get("/stats", getDonationStats);

// Protected routes
router.post("/order", protect, validate(createOrderSchema), createOrder);
router.post("/verify", protect, validate(verifyPaymentSchema), verifyPayment);
router.post("/donate", protect, createDonation);
router.get("/my-donations", protect, getMyDonations);
router.get("/:id/receipt.pdf", protect, getDonationReceipt);

// Admin routes
router.get(
  "/admin/all",
  protect,
  hasPermission(PERMISSIONS.DONATIONS_MANAGE),
  getAllDonationsAdmin
);
router.post(
  "/campaigns",
  protect,
  hasPermission(PERMISSIONS.DONATIONS_MANAGE),
  createCampaign
);
router.put(
  "/campaigns/:id",
  protect,
  hasPermission(PERMISSIONS.DONATIONS_MANAGE),
  updateCampaign
);
router.delete(
  "/campaigns/:id",
  protect,
  hasPermission(PERMISSIONS.DONATIONS_DELETE),
  deleteCampaign
);

export default router;
