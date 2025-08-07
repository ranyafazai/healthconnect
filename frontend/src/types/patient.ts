import type { User } from './data';
import type { File } from './data';
import type { Appointment } from './data/appointment';
import type { Review } from './data/review';
import type { MedicalRecord } from './data/medicalRecord';

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
