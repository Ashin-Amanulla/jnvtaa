import apiClient from "./client";

export const searchAPI = {
  global: (q) => apiClient.get("/search", { params: { q } }),
};
