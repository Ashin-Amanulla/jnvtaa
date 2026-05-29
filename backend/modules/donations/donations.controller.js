import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import { Donation, DonationCampaign } from "./donations.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayKeyId,
} from "../../services/razorpay.service.js";
import { isStaff } from "../../config/roles.js";
import PDFDocument from "pdfkit";

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

const completeDonation = async (donation) => {
  if (donation.paymentStatus === "completed") {
    return donation;
  }

  donation.paymentStatus = "completed";
  donation.transactionId =
    donation.razorpayPaymentId ||
    `TXN${Date.now()}${Math.random().toString(36).substring(7)}`;
  await donation.save();

  const campaignDoc = await DonationCampaign.findById(donation.campaign);
  if (campaignDoc) {
    campaignDoc.raised += donation.amount;
    if (campaignDoc.raised >= campaignDoc.goal) {
      campaignDoc.status = "completed";
    }
    await campaignDoc.save();
  }

  return donation;
};

// Create Razorpay order
export const createOrder = asyncHandler(async (req, res, next) => {
  const { campaign, amount, paymentMethod, isAnonymous, message } = req.body;

  const campaignDoc = await DonationCampaign.findById(campaign);

  if (!campaignDoc) {
    return next(new AppError("Campaign not found", 404));
  }

  if (campaignDoc.status !== "active") {
    return next(new AppError("Campaign is not active", 400));
  }

  const donation = await Donation.create({
    campaign,
    donor: req.user.id,
    amount,
    paymentMethod,
    isAnonymous,
    message,
    paymentStatus: "pending",
  });

  const order = await createRazorpayOrder({
    amount,
    currency: donation.currency,
    receipt: donation._id.toString(),
    notes: {
      donationId: donation._id.toString(),
      campaignId: campaign,
    },
  });

  donation.razorpayOrderId = order.id;
  await donation.save();

  await donation.populate("donor", "firstName lastName avatar");
  await donation.populate("campaign", "title goal raised");

  sendSuccess(
    res,
    201,
    {
      donation,
      order,
      keyId: getRazorpayKeyId(),
    },
    "Payment order created successfully"
  );
});

// Verify Razorpay payment
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const isValid = verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    return next(new AppError("Invalid payment signature", 400));
  }

  const donation = await Donation.findOne({
    razorpayOrderId: razorpay_order_id,
    donor: req.user.id,
  });

  if (!donation) {
    return next(new AppError("Donation not found", 404));
  }

  donation.razorpayPaymentId = razorpay_payment_id;
  donation.razorpaySignature = razorpay_signature;
  await completeDonation(donation);

  await donation.populate("donor", "firstName lastName avatar");
  await donation.populate("campaign", "title goal raised");

  sendSuccess(res, 200, { donation }, "Payment verified successfully");
});

// Generate PDF receipt
export const getDonationReceipt = asyncHandler(async (req, res, next) => {
  const donation = await Donation.findById(req.params.id)
    .populate("donor", "firstName lastName email")
    .populate("campaign", "title");

  if (!donation) {
    return next(new AppError("Donation not found", 404));
  }

  if (donation.paymentStatus !== "completed") {
    return next(new AppError("Receipt is only available for completed donations", 400));
  }

  const isDonor = donation.donor._id.toString() === req.user.id;
  const isAdmin = isStaff(req.user);

  if (!isDonor && !isAdmin) {
    return next(new AppError("Not authorized to download this receipt", 403));
  }

  const doc = new PDFDocument({ margin: 50 });
  const filename = `receipt-${donation._id}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res);

  doc.fontSize(20).text("JNVTAA Donation Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Receipt ID: ${donation._id}`);
  doc.text(`Date: ${donation.createdAt.toLocaleDateString("en-IN")}`);
  doc.text(`Campaign: ${donation.campaign.title}`);
  doc.text(`Amount: ${donation.currency} ${donation.amount}`);
  doc.text(`Payment ID: ${donation.razorpayPaymentId || donation.transactionId}`);
  doc.text(`Status: ${donation.paymentStatus}`);

  if (!donation.isAnonymous) {
    doc.moveDown();
    doc.text(
      `Donor: ${donation.donor.firstName} ${donation.donor.lastName}`
    );
    doc.text(`Email: ${donation.donor.email}`);
  }

  if (donation.message) {
    doc.moveDown();
    doc.text(`Message: ${donation.message}`);
  }

  doc.moveDown(2);
  doc.text("Thank you for your generous contribution.", { align: "center" });

  doc.end();
});

// Admin: Get all donations
export const getAllDonationsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { paymentStatus, campaign } = req.query;

  const query = {};
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (campaign) query.campaign = campaign;

  const donations = await Donation.find(query)
    .populate("donor", "firstName lastName email avatar")
    .populate("campaign", "title goal raised")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Donation.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { donations },
    pagination,
    "Donations retrieved successfully"
  );
});

// Create donation (legacy stub replaced by order flow)
export const createDonation = asyncHandler(async (req, res, next) => {
  return next(
    new AppError(
      "Use POST /api/donations/order to create a Razorpay payment order",
      400
    )
  );
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
