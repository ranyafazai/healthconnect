// frontend/src/lib/axios.ts
import axios from "axios";
import config from "../config/env";

const instance = axios.create({
  baseURL: config.API_URL,
  withCredentials: true, // send cookies (important for backend cookie-based auth)
});

// Request interceptor for adding auth token
instance.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only redirect on 401 errors if it's not an authentication check
    // Authentication checks should fail gracefully without redirecting
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/me')) {
      // Handle unauthorized access for non-auth endpoints
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export default instance;
