import axiosInstance from '../lib/axios';
import type { Review, ReviewsStats } from '../types/data/review';

export const reviewApi = {
  getDoctorReviews: async (doctorId: number): Promise<Review[]> => {
    const response = await axiosInstance.get(`/reviews/doctor/${doctorId}`);
    return response.data?.data ?? response.data;
  },

  getDoctorReviewStats: async (doctorId: number): Promise<ReviewsStats> => {
    const response = await axiosInstance.get(`/reviews/doctor/${doctorId}/stats`);
    return response.data?.data ?? response.data;
  },

  getPatientReviews: async (patientId: number): Promise<Review[]> => {
    const response = await axiosInstance.get(`/reviews/patient/${patientId}`);
    return response.data?.data ?? response.data;
  },

  createReview: async (reviewData: Partial<Review>): Promise<Review> => {
    const response = await axiosInstance.post('/reviews', reviewData);
    return response.data?.data ?? response.data;
  },

  deleteReview: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/reviews/${id}`);
  }
};