import apiClient from "./client";

export const newsletterAPI = {
  subscribe: (data) => apiClient.post("/newsletter/subscribe", data),
};
