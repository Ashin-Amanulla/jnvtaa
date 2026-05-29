import Notification from "../modules/notifications/notifications.model.js";

export const createNotification = async (
  userId,
  { type, title, body = "", link = "" }
) => {
  return Notification.create({
    user: userId,
    type,
    title,
    body,
    link,
  });
};

export default createNotification;
