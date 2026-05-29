import apiClient from "./client";

export const notificationsAPI = {
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),
  getAll: (params) => apiClient.get("/notifications", { params }),
  markRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put("/notifications/read-all"),
};
