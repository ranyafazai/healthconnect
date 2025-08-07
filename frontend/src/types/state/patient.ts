import type { MedicalRecord } from "../data";

export interface PatientProfile {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  medicalHistory?: string;
  photoUrl?: string;
  phoneNumber?: string;
}

export interface PatientState {
  profile: PatientProfile | null;
  medicalRecords: MedicalRecord[];
  loading: boolean;
  error: string | null;
}
