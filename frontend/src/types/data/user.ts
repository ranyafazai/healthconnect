import type { DoctorProfile } from './doctor';
import type { PatientProfile } from './patient';
import type { Notification } from './notification';
import type { File } from './file';

export const UserRole = {
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  doctorProfile?: DoctorProfile;
  patientProfile?: PatientProfile;
  notifications?: Notification[];
  messagesSent?: any[]; // Will be populated with Message data from backend
  messagesReceived?: any[]; // Will be populated with Message data from backend
  files?: File[];
}
