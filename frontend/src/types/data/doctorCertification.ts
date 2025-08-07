import type { DoctorProfile } from '../doctor';
import type { File } from './file';

export interface DoctorCertification {
  id: number;
  doctorProfileId: number;
  fileId: number;
  
  doctorProfile?: DoctorProfile;
  file?: File;
}
