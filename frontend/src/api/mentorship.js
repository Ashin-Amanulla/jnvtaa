import apiClient from "./client";

export const mentorshipAPI = {
  getMentors: () => apiClient.get("/mentorship/mentors"),
  becomeMentor: (data) => apiClient.post("/mentorship/become-mentor", data),
  updateProfile: (data) => apiClient.put("/mentorship/profile", data),
  getMyRequests: () => apiClient.get("/mentorship/requests"),
  createRequest: (mentorId, data) =>
    apiClient.post(`/mentorship/request/${mentorId}`, data),
  respondToRequest: (id, data) =>
    apiClient.put(`/mentorship/requests/${id}/respond`, data),
};
