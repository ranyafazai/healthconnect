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
    // For cookie-based auth, we don't need to manually add the token
    // The cookie will be sent automatically with withCredentials: true
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
      // Use window.location.href only as a last resort
      console.warn('Unauthorized access detected, but not redirecting to prevent infinite loops');
    }
    return Promise.reject(error);
  }
);

export default instance;
