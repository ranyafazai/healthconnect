// frontend/src/Api/auth.api.ts
import axios from "../lib/axios";

export type AuthPayload = { 
  email: string; 
  password: string; 
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export const register = (data: AuthPayload) => axios.post("/auth/register", data);
export const login = (data: AuthPayload) => axios.post("/auth/login", data);
export const logout = () => axios.post("/auth/logout");
export const getMe = () => axios.get("/auth/me");
