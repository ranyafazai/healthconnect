import type { User } from './user';
import type { File } from './file';
import type { DoctorCertification } from './doctorCertification';
import type { Appointment } from './appointment';
import type { Review } from './review';

export interface DoctorProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  photoId?: number;
  professionalBio?: string;
  specialization: string;
  yearsExperience: number;
  medicalLicense: string;
  officeAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  availability: {
    [day: string]: {
      slots: Array<{
        start: string;
        end: string;
      }>;
      bufferTime: number;
      consultingDuration: number;
    };
  };
  avgReview?: number;

  user?: User;
  photo?: File;
  appointments?: Appointment[];
  reviews?: Review[];
  certifications?: DoctorCertification[];
}
