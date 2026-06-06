import axios from "axios";
import { useAuthStore } from "@/store/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5454/api";

const AUTH_PAGES = /^\/(login|register|forgot-password|auth\/callback)(\/|$)/;

let isHandling401 = false;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !isHandling401) {
      isHandling401 = true;

      // Clear zustand persist (auth-storage) as well as legacy keys
      useAuthStore.getState().logout();

      const onAuthPage = AUTH_PAGES.test(window.location.pathname);
      if (!onAuthPage) {
        window.location.href = "/login";
      } else {
        isHandling401 = false;
      }
    }

    const errorMessage =
      error.response?.data?.message || error.message || "Something went wrong";
    const err = new Error(errorMessage);
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);

export default apiClient;
