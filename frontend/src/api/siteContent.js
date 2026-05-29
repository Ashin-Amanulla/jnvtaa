import apiClient from "./client";

export const getSiteContent = (key) => apiClient.get(`/site-content/${key}`);
