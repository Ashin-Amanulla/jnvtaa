import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import { Donation, DonationCampaign } from "./donations.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

// Campaign Controllers

// Get all campaigns
export const getAllCampaigns = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status, category } = req.query;

  const query = { isPublished: true };
  if (status) query.status = status;
  if (category) query.category = category;

  const campaigns = await DonationCampaign.find(query)
    .populate("createdBy", "firstName lastName avatar")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await DonationCampaign.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { campaigns },
    pagination,
    "Campaigns retrieved successfully"
  );
});

// Get single campaign
export const getCampaignById = asyncHandler(async (req, res, next) => {
  const campaign = await DonationCampaign.findById(req.params.id).populate(
    "createdBy",
    "firstName lastName avatar"
  );

  if (!campaign) {
    return next(new AppError("Campaign not found", 404));
  }

  // Get recent donations for this campaign
  const recentDonations = await Donation.find({
    campaign: campaign._id,
    paymentStatus: "completed",
    isAnonymous: false,
  })
    .populate("donor", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .limit(10);

  sendSuccess(
    res,
    200,
    { campaign, recentDonations },
    "Campaign retrieved successfully"
  );
});

// Create campaign (Admin)
export const createCampaign = asyncHandler(async (req, res) => {
  const campaignData = {
    ...req.body,
    createdBy: req.user.id,
  };

  const campaign = await DonationCampaign.create(campaignData);
  await campaign.populate("createdBy", "firstName lastName avatar");

  sendSuccess(res, 201, { campaign }, "Campaign created successfully");
});

// Update campaign (Admin)
export const updateCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await DonationCampaign.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).populate("createdBy", "firstName lastName avatar");

  if (!campaign) {
    return next(new AppError("Campaign not found", 404));
  }

  sendSuccess(res, 200, { campaign }, "Campaign updated successfully");
});

// Delete campaign (Admin)
export const deleteCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await DonationCampaign.findById(req.params.id);

  if (!campaign) {
    return next(new AppError("Campaign not found", 404));
  }

  await campaign.deleteOne();

  sendSuccess(res, 200, null, "Campaign deleted successfully");
});

// Donation Controllers

// Create donation
export const createDonation = asyncHandler(async (req, res, next) => {
  const { campaign, amount, paymentMethod, isAnonymous, message } = req.body;

  // Check if campaign exists and is active
  const campaignDoc = await DonationCampaign.findById(campaign);

  if (!campaignDoc) {
    return next(new AppError("Campaign not found", 404));
  }

  if (campaignDoc.status !== "active") {
    return next(new AppError("Campaign is not active", 400));
  }

  // Create donation
  const donation = await Donation.create({
    campaign,
    donor: req.user.id,
    amount,
    paymentMethod,
    isAnonymous,
    message,
    transactionId: `TXN${Date.now()}${Math.random().toString(36).substring(7)}`,
  });

  // In a real app, integrate with payment gateway here
  // For now, we'll mark as completed
  donation.paymentStatus = "completed";
  await donation.save();

  // Update campaign raised amount
  campaignDoc.raised += amount;
  if (campaignDoc.raised >= campaignDoc.goal) {
    campaignDoc.status = "completed";
  }
  await campaignDoc.save();

  await donation.populate("donor", "firstName lastName avatar");
  await donation.populate("campaign", "title goal raised");

  sendSuccess(res, 201, { donation }, "Donation created successfully");
});

// Get all donations for a campaign
export const getCampaignDonations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);

  const donations = await Donation.find({
    campaign: req.params.id,
    paymentStatus: "completed",
  })
    .populate("donor", "firstName lastName avatar")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Donation.countDocuments({
    campaign: req.params.id,
    paymentStatus: "completed",
  });
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { donations },
    pagination,
    "Donations retrieved successfully"
  );
});

// Get user's donations
export const getMyDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({
    donor: req.user.id,
  })
    .populate("campaign", "title goal raised coverImage")
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, { donations }, "Your donations retrieved successfully");
});

// Get donation statistics
export const getDonationStats = asyncHandler(async (req, res) => {
  const totalCampaigns = await DonationCampaign.countDocuments({
    isPublished: true,
  });
  const activeCampaigns = await DonationCampaign.countDocuments({
    status: "active",
    isPublished: true,
  });

  const totalRaised = await Donation.aggregate([
    { $match: { paymentStatus: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalDonors = await Donation.distinct("donor", {
    paymentStatus: "completed",
  });

  sendSuccess(
    res,
    200,
    {
      stats: {
        totalCampaigns,
        activeCampaigns,
        totalRaised: totalRaised[0]?.total || 0,
        totalDonors: totalDonors.length,
      },
    },
    "Statistics retrieved successfully"
  );
});
