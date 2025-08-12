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
  // Debug: request log
  console.log('[appointments] GET', url);
  return axios
    .get<{ data: { data: Appointment[] } }>(url)
    .then((res) => {
      // Debug: response log
      console.log('[appointments] OK', { status: res.status, url, data: res.data });
      return res;
    })
    .catch((err) => {
      // Debug: error log
      console.error('[appointments] ERR', {
        url,
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      throw err;
    });
};

export const getAppointmentsByDoctor = (doctorId: number, page = 1, limit = 50) => {
  const url = `/appointments/doctor/${doctorId}?page=${page}&limit=${limit}`;
  console.log('[appointments] GET', url);
  return axios
    .get<{ data: { data: Appointment[] } }>(url)
    .then((res) => {
      console.log('[appointments] OK', { status: res.status, url, data: res.data });
      return res;
    })
    .catch((err) => {
      console.error('[appointments] ERR', {
        url,
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      throw err;
    });
};

export const getAppointmentsByPatient = (patientId: number, page = 1, limit = 50) => {
  const url = `/appointments/patient/${patientId}?page=${page}&limit=${limit}`;
  console.log('[appointments] GET', url);
  return axios
    .get<{ data: { data: Appointment[] } }>(url)
    .then((res) => {
      console.log('[appointments] OK', { status: res.status, url, data: res.data });
      return res;
    })
    .catch((err) => {
      console.error('[appointments] ERR', {
        url,
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      throw err;
    });
};

export const getAppointmentById = (id: number) => {
  const url = `/appointments/${id}`;
  console.log('[appointments] GET', url);
  return axios
    .get<{ data: { data: Appointment } }>(url)
    .then((res) => {
      console.log('[appointments] OK', { status: res.status, url, data: res.data });
      return res;
    })
    .catch((err) => {
      console.error('[appointments] ERR', {
        url,
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      throw err;
    });
};

export const updateAppointmentStatus = (id: number, status: AppointmentStatus) => 
  axios.patch<{ data: { data: Appointment } }>(`/appointments/${id}/status`, { status });

export const deleteAppointment = (id: number) => 
  axios.delete(`/appointments/${id}`);
