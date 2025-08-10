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
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export default instance;
