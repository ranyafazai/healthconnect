import axios from '../lib/axios';
import type { DoctorProfile } from '../types/data/doctor';

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

export const getDoctorAvailability = (doctorId: number, date: string) => 
  axios.get<{ data: { availableSlots: string[] } }>(`/doctors/${doctorId}/availability?date=${date}`);

export const searchDoctors = (filters: {
  query?: string;
  specialization?: string;
  city?: string;
  rating?: number;
  availability?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  return axios.get<{ data: DoctorProfile[]; pagination?: any }>(`/doctors/search?${params.toString()}`);
};
