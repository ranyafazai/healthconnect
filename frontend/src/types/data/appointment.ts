import type { DoctorProfile } from '../doctor';
import type { PatientProfile } from '../patient';
import type { Message } from '../state/message';
import type { File } from './file';

export const AppointmentStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const ConsultationType = {
  TEXT: 'TEXT',
  VIDEO: 'VIDEO'
} as const;

export type ConsultationType = typeof ConsultationType[keyof typeof ConsultationType];

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  date: Date;
  status: AppointmentStatus;
  type: ConsultationType;
  reason?: string;
  notes?: string;
  recordingId?: number;
  createdAt: Date;
  
  doctor?: DoctorProfile;
  patient?: PatientProfile;
  recording?: File;
  messages?: Message[];
}
