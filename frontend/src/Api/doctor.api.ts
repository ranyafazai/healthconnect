import axios from '../lib/axios';
import type { DoctorProfile } from '../types/doctor';

export const getAllDoctors = () => 
  axios.get<{ data: DoctorProfile[] }>('/doctors');

export const getDoctorById = (id: number) => 
  axios.get<{ data: DoctorProfile }>(`/doctors/${id}`);

export const getDoctorDashboard = () => 
  axios.get<{ data: any }>('/doctors/dashboard/data');

export const createDoctorProfile = (data: Partial<DoctorProfile>) => 
  axios.post<{ data: DoctorProfile }>('/doctors', data);

export const updateDoctorProfile = (id: number, data: Partial<DoctorProfile>) => 
  axios.put<{ data: DoctorProfile }>(`/doctors/${id}`, data);

export const deleteDoctorProfile = (id: number) => 
  axios.delete(`/doctors/${id}`);

export const searchDoctors = (filters: {
  specialization?: string;
  rating?: number;
  availability?: string;
  city?: string;
  state?: string;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });
  return axios.get<{ data: DoctorProfile[] }>(`/doctors?${params.toString()}`);
};
