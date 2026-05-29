import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import Notification from "./notifications.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const query = { user: req.user.id };

  if (req.query.isRead !== undefined) {
    query.isRead = req.query.isRead === "true";
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { notifications },
    pagination,
    "Notifications retrieved successfully"
  );
});

export const markNotificationRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  notification.isRead = true;
  await notification.save();

  sendSuccess(res, 200, { notification }, "Notification marked as read");
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true }
  );

  sendSuccess(
    res,
    200,
    { modifiedCount: result.modifiedCount },
    "All notifications marked as read"
  );
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
  });

  sendSuccess(res, 200, { count }, "Unread count retrieved successfully");
});
