import apiClient from "./client";

export const contactAPI = {
  submit: (data) => apiClient.post("/contact", data),
};
