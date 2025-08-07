import { FileType } from "../data/file";
import { Review } from "../data/review";

export interface DoctorProfile {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  yearsExperience: number;
  avgReview: number;
  medicalLicense: string;
  availability: Record<string, any>;
  photoUrl?: string;
  certifications: FileType[];
  reviews: Review[];
}

export interface DoctorState {
  profile: DoctorProfile | null;
  loading: boolean;
  error: string | null;
}
