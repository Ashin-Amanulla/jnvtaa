import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import ContactMessage from "./contact-messages.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

export const createContactMessage = asyncHandler(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return next(
      new AppError("Name, email, subject, and message are required", 400)
    );
  }

  const contactMessage = await ContactMessage.create({
    name,
    email,
    subject,
    message,
  });

  sendSuccess(
    res,
    201,
    { contactMessage },
    "Your message has been sent successfully"
  );
});

export const getContactMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status } = req.query;

  const query = {};
  if (status) query.status = status;

  const contactMessages = await ContactMessage.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ContactMessage.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { contactMessages },
    pagination,
    "Contact messages retrieved successfully"
  );
});

export const getContactMessageById = asyncHandler(async (req, res, next) => {
  const contactMessage = await ContactMessage.findById(req.params.id).populate(
    "replyNotes.author",
    "firstName lastName email"
  );

  if (!contactMessage) {
    return next(new AppError("Contact message not found", 404));
  }

  if (contactMessage.status === "new") {
    contactMessage.status = "read";
    await contactMessage.save({ validateBeforeSave: false });
  }

  sendSuccess(
    res,
    200,
    { contactMessage },
    "Contact message retrieved successfully"
  );
});

export const updateContactMessageStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ["new", "read", "resolved"];

  if (!status || !allowed.includes(status)) {
    return next(
      new AppError(`Status must be one of: ${allowed.join(", ")}`, 400)
    );
  }

  const contactMessage = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!contactMessage) {
    return next(new AppError("Contact message not found", 404));
  }

  sendSuccess(
    res,
    200,
    { contactMessage },
    "Contact message status updated successfully"
  );
});

export const addReplyNote = asyncHandler(async (req, res, next) => {
  const { note } = req.body;

  if (!note) {
    return next(new AppError("Reply note is required", 400));
  }

  const contactMessage = await ContactMessage.findById(req.params.id);

  if (!contactMessage) {
    return next(new AppError("Contact message not found", 404));
  }

  contactMessage.replyNotes.push({
    note,
    author: req.user.id,
  });

  if (contactMessage.status === "new") {
    contactMessage.status = "read";
  }

  await contactMessage.save();
  await contactMessage.populate("replyNotes.author", "firstName lastName email");

  sendSuccess(
    res,
    201,
    { contactMessage },
    "Reply note added successfully"
  );
});
