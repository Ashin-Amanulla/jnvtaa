import apiClient from "./client";

export const uploadsAPI = {
  sign: (payload) => apiClient.post("/uploads/sign", payload),
};
