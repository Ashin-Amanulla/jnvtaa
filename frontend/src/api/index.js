export { authAPI } from "./auth";
export { usersAPI } from "./users";

import apiClient from "./client";

export const batchesAPI = {
  getAll: (params) => apiClient.get("/batches", { params }),
  getById: (id) => apiClient.get(`/batches/${id}`),
  create: (data) => apiClient.post("/batches", data),
  update: (id, data) => apiClient.put(`/batches/${id}`, data),
  delete: (id) => apiClient.delete(`/batches/${id}`),
  addReunion: (id, data) => apiClient.post(`/batches/${id}/reunions`, data),
};

export const eventsAPI = {
  getAll: (params) => apiClient.get("/events", { params }),
  getById: (id) => apiClient.get(`/events/${id}`),
  getUpcoming: () => apiClient.get("/events/upcoming"),
  create: (data) => apiClient.post("/events", data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  delete: (id) => apiClient.delete(`/events/${id}`),
  rsvp: (id) => apiClient.post(`/events/${id}/rsvp`),
  cancelRsvp: (id) => apiClient.post(`/events/${id}/cancel-rsvp`),
};

export const newsAPI = {
  getAll: (params) => apiClient.get("/news", { params }),
  getById: (id) => apiClient.get(`/news/${id}`),
  getLatest: () => apiClient.get("/news/latest"),
  create: (data) => apiClient.post("/news", data),
  update: (id, data) => apiClient.put(`/news/${id}`, data),
  delete: (id) => apiClient.delete(`/news/${id}`),
  like: (id) => apiClient.post(`/news/${id}/like`),
  addComment: (id, data) => apiClient.post(`/news/${id}/comments`, data),
  deleteComment: (id, commentId) =>
    apiClient.delete(`/news/${id}/comments/${commentId}`),
};

export const galleryAPI = {
  /** S3-backed album from live gallery (proxied by jnvtaa API) */
  getS3Feed: () => apiClient.get("/gallery/media/feed"),
  getAll: (params) => apiClient.get("/gallery", { params }),
  getById: (id) => apiClient.get(`/gallery/${id}`),
  create: (data) => apiClient.post("/gallery", data),
  update: (id, data) => apiClient.put(`/gallery/${id}`, data),
  delete: (id) => apiClient.delete(`/gallery/${id}`),
  approve: (id) => apiClient.put(`/gallery/${id}/approve`),
  like: (id) => apiClient.post(`/gallery/${id}/like`),
  addComment: (id, data) => apiClient.post(`/gallery/${id}/comments`, data),
};

export const donationsAPI = {
  getAllCampaigns: (params) =>
    apiClient.get("/donations/campaigns", { params }),
  getCampaignById: (id) => apiClient.get(`/donations/campaigns/${id}`),
  createCampaign: (data) => apiClient.post("/donations/campaigns", data),
  updateCampaign: (id, data) =>
    apiClient.put(`/donations/campaigns/${id}`, data),
  deleteCampaign: (id) => apiClient.delete(`/donations/campaigns/${id}`),
  donate: (data) => apiClient.post("/donations/donate", data),
  getMyDonations: () => apiClient.get("/donations/my-donations"),
  getCampaignDonations: (id, params) =>
    apiClient.get(`/donations/campaigns/${id}/donations`, { params }),
  getStats: () => apiClient.get("/donations/stats"),
};

export const jobsAPI = {
  getAll: (params) => apiClient.get("/jobs", { params }),
  getById: (id) => apiClient.get(`/jobs/${id}`),
  create: (data) => apiClient.post("/jobs", data),
  update: (id, data) => apiClient.put(`/jobs/${id}`, data),
  delete: (id) => apiClient.delete(`/jobs/${id}`),
  apply: (id) => apiClient.post(`/jobs/${id}/apply`),
  getMyJobs: () => apiClient.get("/jobs/my/posted"),
  getAppliedJobs: () => apiClient.get("/jobs/my/applied"),
};
