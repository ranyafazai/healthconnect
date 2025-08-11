import axiosInstance from '../lib/axios';
import type { Review, ReviewsStats } from '../types/data/review';

export const reviewApi = {
  getDoctorReviews: async (doctorId: number): Promise<Review[]> => {
    console.log('[reviewApi] GET /reviews/doctor/' + doctorId);
    const response = await axiosInstance.get(`/reviews/doctor/${doctorId}`);
    console.log('[reviewApi] Response getDoctorReviews', {
      status: response.status,
      url: response.config?.url,
      method: response.config?.method,
      data: response.data,
    });
    return response.data?.data ?? response.data;
  },

  getDoctorReviewStats: async (doctorId: number): Promise<ReviewsStats> => {
    console.log('[reviewApi] GET /reviews/doctor/' + doctorId + '/stats');
    const response = await axiosInstance.get(`/reviews/doctor/${doctorId}/stats`);
    console.log('[reviewApi] Response getDoctorReviewStats', {
      status: response.status,
      url: response.config?.url,
      method: response.config?.method,
      data: response.data,
    });
    return response.data?.data ?? response.data;
  },

  getPatientReviews: async (patientId: number): Promise<Review[]> => {
    console.log('[reviewApi] GET /reviews/patient/' + patientId);
    const response = await axiosInstance.get(`/reviews/patient/${patientId}`);
    console.log('[reviewApi] Response getPatientReviews', {
      status: response.status,
      url: response.config?.url,
      method: response.config?.method,
      data: response.data,
    });
    return response.data?.data ?? response.data;
  },

  createReview: async (reviewData: Partial<Review>): Promise<Review> => {
    console.log('[reviewApi] POST /reviews', { body: reviewData });
    const response = await axiosInstance.post('/reviews', reviewData);
    console.log('[reviewApi] Response createReview', {
      status: response.status,
      url: response.config?.url,
      method: response.config?.method,
      data: response.data,
    });
    return response.data?.data ?? response.data;
  },

  deleteReview: async (id: number): Promise<void> => {
    console.log('[reviewApi] DELETE /reviews/' + id);
    const response = await axiosInstance.delete(`/reviews/${id}`);
    console.log('[reviewApi] Response deleteReview', {
      status: response.status,
      url: response.config?.url,
      method: response.config?.method,
      data: response.data,
    });
  }
};