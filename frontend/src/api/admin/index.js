import apiClient from "../client";

export const adminUsersAPI = {
  getAll: (params) => apiClient.get("/users/admin/all", { params }),
  getUnverified: (params) => apiClient.get("/users/admin/unverified", { params }),
  getStats: () => apiClient.get("/users/stats"),
  verify: (id) => apiClient.put(`/users/admin/verify/${id}`),
  updateRole: (id, role) => apiClient.put(`/users/admin/${id}/role`, { role }),
  deactivate: (id) => apiClient.put(`/users/admin/${id}/deactivate`),
  update: (id, data) => apiClient.put(`/users/admin/${id}`, data),
};

export const adminBatchesAPI = {
  getAll: (params) => apiClient.get("/batches", { params }),
  getById: (id) => apiClient.get(`/batches/${id}`),
  create: (data) => apiClient.post("/batches", data),
  update: (id, data) => apiClient.put(`/batches/${id}`, data),
  delete: (id) => apiClient.delete(`/batches/${id}`),
};

export const adminEventsAPI = {
  getAll: (params) => apiClient.get("/events", { params }),
  getById: (id) => apiClient.get(`/events/${id}`),
  create: (data) => apiClient.post("/events", data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  delete: (id) => apiClient.delete(`/events/${id}`),
};

export const adminNewsAPI = {
  getAll: (params) => apiClient.get("/news", { params }),
  getById: (id) => apiClient.get(`/news/${id}`),
  create: (data) => apiClient.post("/news", data),
  update: (id, data) => apiClient.put(`/news/${id}`, data),
  delete: (id) => apiClient.delete(`/news/${id}`),
};

export const adminGalleryAPI = {
  getAll: (params) => apiClient.get("/gallery", { params }),
  getById: (id) => apiClient.get(`/gallery/${id}`),
  approve: (id) => apiClient.put(`/gallery/${id}/approve`),
  delete: (id) => apiClient.delete(`/gallery/${id}`),
  getFolders: () => apiClient.get("/gallery/folders"),
  getFolderImages: (slug) =>
    apiClient.get("/gallery/folders/images", { params: { slug } }),
  deleteS3Image: (key) =>
    apiClient.delete("/gallery/s3/image", { data: { key } }),
  renameFolder: (slug, newName) =>
    apiClient.patch("/gallery/folders/rename", { slug, newName }),
  deleteFolder: (slug) =>
    apiClient.delete("/gallery/folders", { data: { slug } }),
  uploadImages: (formData) =>
    apiClient.post("/gallery/upload", formData, {
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers["Content-Type"];
          }
          return data;
        },
      ],
    }),
};

export const adminDonationsAPI = {
  getStats: () => apiClient.get("/donations/stats"),
  getAllDonations: (params) => apiClient.get("/donations/admin/all", { params }),
  getCampaigns: (params) => apiClient.get("/donations/campaigns", { params }),
  getCampaignById: (id) => apiClient.get(`/donations/campaigns/${id}`),
  createCampaign: (data) => apiClient.post("/donations/campaigns", data),
  updateCampaign: (id, data) => apiClient.put(`/donations/campaigns/${id}`, data),
  deleteCampaign: (id) => apiClient.delete(`/donations/campaigns/${id}`),
};

export const adminJobsAPI = {
  getAll: (params) => apiClient.get("/jobs", { params }),
  getById: (id) => apiClient.get(`/jobs/${id}`),
  update: (id, data) => apiClient.put(`/jobs/${id}`, data),
  delete: (id) => apiClient.delete(`/jobs/${id}`),
};

export const adminMentorshipAPI = {
  getProfiles: (params) => apiClient.get("/mentorship/admin/profiles", { params }),
  approve: (id) => apiClient.put(`/mentorship/admin/profiles/${id}/approve`),
};

export const adminNewsletterAPI = {
  getSubscribers: (params) => apiClient.get("/newsletter/subscribers", { params }),
  createCampaign: (data) => apiClient.post("/newsletter/campaigns", data),
  sendCampaign: (id) => apiClient.post(`/newsletter/campaigns/${id}/send`),
};

export const adminContactAPI = {
  getAll: (params) => apiClient.get("/contact", { params }),
  getById: (id) => apiClient.get(`/contact/${id}`),
  updateStatus: (id, status) => apiClient.put(`/contact/${id}/status`, { status }),
  addReplyNote: (id, note) => apiClient.post(`/contact/${id}/reply-notes`, { note }),
};

export const adminSiteContentAPI = {
  getAll: () => apiClient.get("/site-content"),
  getByKey: (key) => apiClient.get(`/site-content/${key}`),
  upsert: (key, data) => apiClient.put(`/site-content/${key}`, { data }),
};

export const adminAuditLogAPI = {
  getAll: (params) => apiClient.get("/audit-log", { params }),
};

export const adminUploadsAPI = {
  sign: (payload) => apiClient.post("/uploads/sign", payload),
};

export const adminRolesAPI = {
  getAll: () => apiClient.get("/roles"),
};

export const adminFifaAPI = {
  getCampaign: () => apiClient.get("/fifa/campaign"),
  createCampaign: (data) => apiClient.post("/fifa/admin/campaign", data),
  updateCampaign: (id, data) =>
    apiClient.put(`/fifa/admin/campaign/${id}`, data),
  createMatch: (data) => apiClient.post("/fifa/admin/matches", data),
  updateMatch: (id, data) => apiClient.put(`/fifa/admin/matches/${id}`, data),
  deleteMatch: (id) => apiClient.delete(`/fifa/admin/matches/${id}`),
  enterResult: (id, data) =>
    apiClient.put(`/fifa/admin/matches/${id}/result`, data),
  getStudents: () => apiClient.get("/fifa/admin/students"),
  deleteStudent: (id) => apiClient.delete(`/fifa/admin/students/${id}`),
};
