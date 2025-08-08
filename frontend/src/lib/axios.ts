// frontend/src/lib/axios.ts
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // send cookies (important for backend cookie-based auth)
});

export default instance;
