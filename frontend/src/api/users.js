import apiClient from "./client";

export const usersAPI = {
  getAllUsers: (params) => apiClient.get("/users", { params }),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  updateProfile: (data) => apiClient.put("/users/profile", data),
  deleteAccount: () => apiClient.delete("/users/account"),
  getUserStats: () => apiClient.get("/users/stats"),
  getUnverifiedUsers: (params) =>
    apiClient.get("/users/admin/unverified", { params }),
  verifyUser: (id) => apiClient.put(`/users/admin/verify/${id}`),
};
