import axios from '../lib/axios';
import type { Appointment, AppointmentStatus } from '../types/data/appointment';

export const createAppointment = (data: {
  doctorId: number;
  date: string;
  type: 'TEXT' | 'VIDEO';
  reason?: string;
  notes?: string;
}) => axios.post<{ data: { data: Appointment } }>('/appointments', data);

export const getAppointments = () => 
  axios.get<{ data: { data: Appointment[] } }>('/appointments');

export const getAppointmentsByDoctor = (doctorId: number) => 
  axios.get<{ data: { data: Appointment[] } }>(`/appointments/doctor/${doctorId}`);

export const getAppointmentsByPatient = (patientId: number) => 
  axios.get<{ data: { data: Appointment[] } }>(`/appointments/patient/${patientId}`);

export const getAppointmentById = (id: number) => 
  axios.get<{ data: { data: Appointment } }>(`/appointments/${id}`);

export const updateAppointmentStatus = (id: number, status: AppointmentStatus) => 
  axios.patch<{ data: { data: Appointment } }>(`/appointments/${id}/status`, { status });

export const deleteAppointment = (id: number) => 
  axios.delete(`/appointments/${id}`);
