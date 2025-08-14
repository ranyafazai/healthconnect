import type { PatientProfile } from './patient';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: PatientProfile;
  doctor?: { firstName?: string; lastName?: string };
}

export interface ReviewAnalysis {
  topFeedback: {
    [key: string]: string[];
  };
  commonKeywords: string[];
  sentiment: string;
}

export interface ReviewsStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
  analysis: ReviewAnalysis;
}