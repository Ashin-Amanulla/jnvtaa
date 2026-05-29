import apiClient from "./client";

export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  logout: () => apiClient.post("/auth/logout"),
  getMe: () => apiClient.get("/auth/me"),
  updatePassword: (data) => apiClient.put("/auth/update-password", data),
  forgotPassword: (data) => apiClient.post("/auth/forgot-password", data),
  resetPassword: (token, data) =>
    apiClient.post(`/auth/reset-password/${token}`, data),
  refreshToken: (refreshToken) =>
    apiClient.post("/auth/refresh-token", { refreshToken }),
};

export const getGoogleAuthUrl = () =>
  `${import.meta.env.VITE_API_URL || "http://localhost:5454/api"}/auth/google`;
