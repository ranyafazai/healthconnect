import axios from '../lib/axios';
import type { Review } from '../types/review';

export const getDoctorReviews = (doctorId: number) => 
  axios.get<{ data: Review[] }>(`/reviews/doctor/${doctorId}`);

export const createReview = (data: {
  doctorId: number;
  rating: number;
  comment: string;
  appointmentId?: number;
}) => axios.post<{ data: Review }>('/reviews', data);

export const updateReview = (id: number, data: Partial<Review>) => 
  axios.put<{ data: Review }>(`/reviews/${id}`, data);

export const deleteReview = (id: number) => 
  axios.delete(`/reviews/${id}`);
