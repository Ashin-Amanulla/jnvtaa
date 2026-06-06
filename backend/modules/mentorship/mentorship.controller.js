import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import { MentorProfile, MentorshipRequest } from "./mentorship.model.js";
import { sendSuccess } from "../../helpers/response.js";
import { createNotification } from "../../services/notification.service.js";
import {
  getOrSet,
  bustMentorsCache,
  CACHE_KEYS,
  CACHE_TTL,
} from "../../helpers/cache.js";

export const getMentors = asyncHandler(async (req, res) => {
  const mentors = await getOrSet(CACHE_KEYS.mentors(), CACHE_TTL.MENTORS, async () =>
    MentorProfile.find({ isApproved: true, isActive: true })
      .populate("user", "firstName lastName avatar profession company batch bio")
      .sort({ updatedAt: -1 })
      .lean()
  );

  sendSuccess(res, 200, { mentors }, "Mentors retrieved successfully");
});

export const becomeMentor = asyncHandler(async (req, res, next) => {
  const existing = await MentorProfile.findOne({ user: req.user.id });

  if (existing) {
    return next(new AppError("You already have a mentor profile", 400));
  }

  const { domains, bio, availability } = req.body;

  const profile = await MentorProfile.create({
    user: req.user.id,
    domains: domains || [],
    bio: bio || "",
    availability: availability || "open",
    isApproved: false,
    isActive: true,
  });

  await profile.populate("user", "firstName lastName avatar profession company");

  sendSuccess(res, 201, { profile }, "Mentor profile submitted for approval");
});

export const updateMentorProfile = asyncHandler(async (req, res, next) => {
  const profile = await MentorProfile.findOne({ user: req.user.id });

  if (!profile) {
    return next(new AppError("Mentor profile not found", 404));
  }

  const allowed = ["domains", "bio", "availability", "isActive"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      profile[field] = req.body[field];
    }
  });

  await profile.save();
  await profile.populate("user", "firstName lastName avatar profession company");

  sendSuccess(res, 200, { profile }, "Mentor profile updated successfully");
});

export const getMyRequests = asyncHandler(async (req, res) => {
  const asMentee = await MentorshipRequest.find({ mentee: req.user.id })
    .populate("mentor", "firstName lastName avatar email profession")
    .sort({ createdAt: -1 });

  const asMentor = await MentorshipRequest.find({ mentor: req.user.id })
    .populate("mentee", "firstName lastName avatar email profession")
    .sort({ createdAt: -1 });

  sendSuccess(
    res,
    200,
    { asMentee, asMentor },
    "Mentorship requests retrieved successfully"
  );
});

export const createMentorshipRequest = asyncHandler(async (req, res, next) => {
  const mentorId = req.params.mentorId;
  const { message } = req.body;

  if (!message) {
    return next(new AppError("Message is required", 400));
  }

  if (mentorId === req.user.id) {
    return next(new AppError("You cannot request mentorship from yourself", 400));
  }

  const mentorProfile = await MentorProfile.findOne({
    user: mentorId,
    isApproved: true,
    isActive: true,
  });

  if (!mentorProfile) {
    return next(new AppError("Mentor not found or not available", 404));
  }

  const existing = await MentorshipRequest.findOne({
    mentee: req.user.id,
    mentor: mentorId,
    status: { $in: ["pending", "accepted"] },
  });

  if (existing) {
    return next(
      new AppError("You already have an active request with this mentor", 400)
    );
  }

  const request = await MentorshipRequest.create({
    mentee: req.user.id,
    mentor: mentorId,
    message,
  });

  await request.populate("mentor", "firstName lastName avatar");
  await request.populate("mentee", "firstName lastName avatar");

  await createNotification(mentorId, {
    type: "mentorship_request",
    title: "New mentorship request",
    body: `${req.user.firstName} ${req.user.lastName} requested mentorship`,
    link: "/mentorship/requests",
  });

  sendSuccess(res, 201, { request }, "Mentorship request sent successfully");
});

export const getAdminMentorProfiles = asyncHandler(async (req, res) => {
  const { isApproved } = req.query;
  const query = {};

  if (isApproved === "true") query.isApproved = true;
  if (isApproved === "false") query.isApproved = false;

  const profiles = await MentorProfile.find(query)
    .populate("user", "firstName lastName avatar profession company batch email")
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, { profiles }, "Mentor profiles retrieved successfully");
});

export const approveMentorProfile = asyncHandler(async (req, res, next) => {
  const profile = await MentorProfile.findById(req.params.id);

  if (!profile) {
    return next(new AppError("Mentor profile not found", 404));
  }

  profile.isApproved = true;
  await profile.save();
  await profile.populate("user", "firstName lastName avatar profession company batch email");
  await bustMentorsCache();

  sendSuccess(res, 200, { profile }, "Mentor profile approved successfully");
});

export const respondToRequest = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ["accepted", "declined", "completed"];

  if (!status || !allowed.includes(status)) {
    return next(
      new AppError(`Status must be one of: ${allowed.join(", ")}`, 400)
    );
  }

  const request = await MentorshipRequest.findById(req.params.id);

  if (!request) {
    return next(new AppError("Mentorship request not found", 404));
  }

  if (request.mentor.toString() !== req.user.id) {
    return next(new AppError("Not authorized to respond to this request", 403));
  }

  if (request.status === "declined" || request.status === "completed") {
    return next(new AppError("This request can no longer be updated", 400));
  }

  request.status = status;
  await request.save();
  await request.populate("mentor", "firstName lastName avatar");
  await request.populate("mentee", "firstName lastName avatar");

  await createNotification(request.mentee, {
    type: "mentorship_response",
    title: "Mentorship request updated",
    body: `Your request was ${status}`,
    link: "/mentorship/requests",
  });

  sendSuccess(res, 200, { request }, "Mentorship request updated successfully");
});
