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
    // For cookie-based auth, we don't need to manually add the token
    // The cookie will be sent automatically with withCredentials: true
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
instance.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Centralized API error handling
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Request failed';
    console.log('Response error:', {
      url: error.config?.url,
      status: status,
      message: message,
      data: error.response?.data
    });
    if (status === 401 && !error.config?.url?.includes('/auth/me')) {
      // For 401 errors, just redirect to signin - let components handle auth state
      window.location.href = '/auth/signin';
    } else {
      // Surface friendly toast for other errors
      try { toast.error(message); } catch {}
    }
    return Promise.reject(error);
  }
);

export default instance;
