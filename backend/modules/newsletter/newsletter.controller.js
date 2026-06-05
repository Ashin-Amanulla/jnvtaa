import crypto from "crypto";
import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import { Subscriber, Campaign } from "./newsletter.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";
import {
  sendNewsletterConfirmation,
} from "../../services/email.service.js";
import { queueNewsletterCampaign } from "../../queues/newsletter.queue.js";

export const subscribe = asyncHandler(async (req, res, next) => {
  const { email, source } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  let subscriber = await Subscriber.findOne({ email }).select("+confirmToken");

  if (subscriber?.status === "active") {
    return next(new AppError("This email is already subscribed", 400));
  }

  if (!subscriber) {
    subscriber = await Subscriber.create({ email, source: source || "website" });
  } else if (subscriber.status === "unsubscribed") {
    subscriber.status = "pending";
    subscriber.confirmToken = crypto.randomBytes(32).toString("hex");
    await subscriber.save();
    subscriber = await Subscriber.findById(subscriber._id).select("+confirmToken");
  }

  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(
    /\/$/,
    ""
  );
  const confirmUrl = `${frontendUrl}/newsletter/confirm/${subscriber.confirmToken}`;

  try {
    await sendNewsletterConfirmation(email, confirmUrl);
  } catch (err) {
    console.error("Newsletter confirmation email failed:", err.message);
  }

  sendSuccess(
    res,
    201,
    { subscriber: { email: subscriber.email, status: subscriber.status } },
    "Please check your email to confirm subscription"
  );
});

export const confirmSubscription = asyncHandler(async (req, res, next) => {
  const subscriber = await Subscriber.findOne({
    confirmToken: req.params.token,
  }).select("+confirmToken");

  if (!subscriber) {
    return next(new AppError("Invalid or expired confirmation token", 400));
  }

  subscriber.status = "active";
  subscriber.confirmToken = undefined;
  await subscriber.save();

  sendSuccess(
    res,
    200,
    { subscriber: { email: subscriber.email, status: subscriber.status } },
    "Subscription confirmed successfully"
  );
});

export const getSubscribers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status } = req.query;

  const query = {};
  if (status) query.status = status;

  const subscribers = await Subscriber.find(query)
    .select("-confirmToken")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Subscriber.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { subscribers },
    pagination,
    "Subscribers retrieved successfully"
  );
});

export const createCampaign = asyncHandler(async (req, res, next) => {
  const { subject, body } = req.body;

  if (!subject || !body) {
    return next(new AppError("Subject and body are required", 400));
  }

  const campaign = await Campaign.create({
    subject,
    body,
    createdBy: req.user.id,
    status: "draft",
  });

  sendSuccess(res, 201, { campaign }, "Campaign created successfully");
});

export const sendCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return next(new AppError("Campaign not found", 404));
  }

  if (campaign.status === "sent") {
    return next(new AppError("Campaign has already been sent", 400));
  }

  const subscribers = await Subscriber.find({ status: "active" });

  if (subscribers.length === 0) {
    return next(new AppError("No active subscribers to send to", 400));
  }

  if (!process.env.REDIS_URL) {
    return next(
      new AppError("Newsletter queue requires REDIS_URL to be configured", 503)
    );
  }

  const queued = await queueNewsletterCampaign(campaign, subscribers);

  campaign.status = "sent";
  campaign.sentAt = new Date();
  campaign.recipientCount = queued;
  await campaign.save();

  sendSuccess(
    res,
    200,
    { campaign, queued },
    "Campaign queued for delivery"
  );
});
