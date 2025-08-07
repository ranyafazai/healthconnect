import type { DoctorProfile } from '../doctor';
import type { PatientProfile } from '../patient';

export interface Review {
  id: number;
  doctorId: number;
  patientId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  
  doctor?: DoctorProfile;
  patient?: PatientProfile;
}
