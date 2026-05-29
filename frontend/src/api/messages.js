import apiClient from "./client";

export const messagesAPI = {
  getConversations: () => apiClient.get("/messages/conversations"),
  startConversation: (userId) =>
    apiClient.post("/messages/conversations", { userId }),
  getMessages: (conversationId, params) =>
    apiClient.get(`/messages/conversations/${conversationId}/messages`, {
      params,
    }),
  sendMessage: (conversationId, body) =>
    apiClient.post(`/messages/conversations/${conversationId}/messages`, {
      body,
    }),
};
