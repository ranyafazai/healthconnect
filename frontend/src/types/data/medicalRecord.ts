import type { PatientProfile } from '../patient';
import type { File } from './file';

export interface MedicalRecord {
  id: number;
  patientId: number;
  title: string;
  description?: string;
  fileId?: number;
  createdAt: Date;
  
  patient?: PatientProfile;
  file?: File;
}
