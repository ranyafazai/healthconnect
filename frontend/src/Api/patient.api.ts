import axios from '../lib/axios';
import type { PatientProfile } from '../types/patient';

export const getPatientById = (id: number) => 
  axios.get<{ data: PatientProfile }>(`/patients/${id}`);

export const getPatientDashboard = () => 
  axios.get<{ data: any }>('/patients/dashboard/data');

export const createPatientProfile = (data: Partial<PatientProfile>) => 
  axios.post<{ data: PatientProfile }>('/patients', data);

export const updatePatientProfile = (id: number, data: Partial<PatientProfile>) => 
  axios.put<{ data: PatientProfile }>(`/patients/${id}`, data);

export const deletePatientProfile = (id: number) => 
  axios.delete(`/patients/${id}`);
