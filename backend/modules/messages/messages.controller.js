import mongoose from "mongoose";
import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import { Conversation, Message } from "./messages.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";
import { createNotification } from "../../services/notification.service.js";

const participantFilter = (userId) => ({
  participants: userId,
});

const isParticipant = (conversation, userId) =>
  conversation.participants.some((p) => p.toString() === userId);

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find(participantFilter(req.user.id))
    .populate("participants", "firstName lastName avatar")
    .sort({ lastMessageAt: -1 });

  sendSuccess(res, 200, { conversations }, "Conversations retrieved successfully");
});

export const getConversationMessages = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new AppError("Conversation not found", 404));
  }

  if (!isParticipant(conversation, req.user.id)) {
    return next(new AppError("Not authorized to view this conversation", 403));
  }

  const { page, limit, skip } = getPaginationParams(req.query);

  const messages = await Message.find({ conversation: conversation._id })
    .populate("sender", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Message.countDocuments({ conversation: conversation._id });
  const pagination = getPaginationMeta(total, page, limit);

  await Message.updateMany(
    {
      conversation: conversation._id,
      sender: { $ne: req.user.id },
      readBy: { $ne: req.user.id },
    },
    { $addToSet: { readBy: req.user.id } }
  );

  sendPaginated(
    res,
    200,
    { messages: messages.reverse() },
    pagination,
    "Messages retrieved successfully"
  );
});

export const startConversation = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("Valid userId is required", 400));
  }

  if (userId === req.user.id) {
    return next(new AppError("Cannot start a conversation with yourself", 400));
  }

  const participantIds = [req.user.id, userId].sort();

  let conversation = await Conversation.findOne({
    participants: { $all: participantIds, $size: 2 },
  }).populate("participants", "firstName lastName avatar");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: participantIds,
    });
    await conversation.populate("participants", "firstName lastName avatar");
  }

  sendSuccess(res, 200, { conversation }, "Conversation ready");
});

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { body } = req.body;

  if (!body) {
    return next(new AppError("Message body is required", 400));
  }

  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new AppError("Conversation not found", 404));
  }

  if (!isParticipant(conversation, req.user.id)) {
    return next(new AppError("Not authorized to send messages here", 403));
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user.id,
    body,
    readBy: [req.user.id],
  });

  conversation.lastMessage = body.slice(0, 200);
  conversation.lastMessageAt = new Date();
  await conversation.save();

  await message.populate("sender", "firstName lastName avatar");

  const recipientId = conversation.participants.find(
    (p) => p.toString() !== req.user.id
  );

  if (recipientId) {
    await createNotification(recipientId, {
      type: "message",
      title: "New message",
      body: `${req.user.firstName}: ${body.slice(0, 80)}`,
      link: `/messages/${conversation._id}`,
    });
  }

  sendSuccess(res, 201, { message }, "Message sent successfully");
});
