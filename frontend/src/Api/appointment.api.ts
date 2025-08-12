import axios from '../lib/axios';
import type { Appointment, AppointmentStatus } from '../types/data/appointment';

export const createAppointment = (data: {
  doctorId: number;
  date: string;
  type: 'TEXT' | 'VIDEO';
  reason?: string;
  notes?: string;
}) => axios.post<{ data: { data: Appointment } }>('/appointments', data);

export const getAppointments = () => {
  const url = '/appointments';
  return axios.get<{ data: { data: Appointment[] } }>(url);
};

export const getAppointmentsByDoctor = (doctorId: number, page = 1, limit = 50) => {
  const url = `/appointments/doctor/${doctorId}?page=${page}&limit=${limit}`;
  return axios.get<{ data: { data: Appointment[] } }>(url);
};

export const getAppointmentsByPatient = (patientId: number, page = 1, limit = 50) => {
  const url = `/appointments/patient/${patientId}?page=${page}&limit=${limit}`;
  return axios.get<{ data: { data: Appointment[] } }>(url);
};

export const getAppointmentById = (id: number) => {
  const url = `/appointments/${id}`;
  return axios.get<{ data: { data: Appointment } }>(url);
};

export const updateAppointmentStatus = (id: number, status: AppointmentStatus) => 
  axios.patch<{ data: { data: Appointment } }>(`/appointments/${id}/status`, { status });

export const deleteAppointment = (id: number) => 
  axios.delete(`/appointments/${id}`);
