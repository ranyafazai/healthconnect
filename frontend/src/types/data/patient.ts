import type { User } from './user';

export interface PatientProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  photoId?: number;
  dateOfBirth: Date;
  gender: string;
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  user?: User;
}
