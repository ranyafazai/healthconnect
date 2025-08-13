// frontend/src/lib/axios.ts
import axios from "axios";
import config from "../config/env";
import toast from 'react-hot-toast';

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
    // Centralized API error handling
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Request failed';
    if (status === 401 && !error.config?.url?.includes('/auth/me')) {
      // Redirect only if not on auth check
      window.location.href = '/auth/signin';
    } else {
      // Surface friendly toast for other errors
      try { toast.error(message); } catch {}
    }
    return Promise.reject(error);
  }
);

export default instance;
