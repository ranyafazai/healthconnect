export interface UserLite {
  id: number;
  email: string;
  role: 'DOCTOR' | 'PATIENT';
}

import type { DoctorProfile } from './data/doctor';
import type { PatientProfile } from './data/patient';
import type { Notification } from './data/notification';
import type { Message } from './data/message';
import type { File } from './data/file';

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
  messagesSent?: Message[];
  messagesReceived?: Message[];
  files?: File[];
}
