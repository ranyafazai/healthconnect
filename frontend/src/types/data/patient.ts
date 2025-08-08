import type { User } from '.';
import type { File } from '.';
import type { Appointment } from './appointment';
import type { Review } from './review';
import type { MedicalRecord } from './medicalRecord';

export interface PatientProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  photoId?: number;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  medicalHistory?: string;
  
  user?: User;
  photo?: File;
  appointments?: Appointment[];
  reviews?: Review[];
  medicalRecords?: MedicalRecord[];
}
