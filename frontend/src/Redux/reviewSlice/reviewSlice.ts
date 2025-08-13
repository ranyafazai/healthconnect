import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewApi } from '../../Api';
import type { Review, ReviewsStats } from '../../types/data/review';

interface ReviewState {
  reviews: Review[];
  stats: ReviewsStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  stats: null,
  loading: false,
  error: null
};

export const fetchDoctorReviews = createAsyncThunk(
  'review/fetchDoctorReviews',
  async (doctorId: number) => {
    const reviews = await reviewApi.getDoctorReviews(doctorId);
    let stats: ReviewsStats | null = null;
    try {
      stats = await reviewApi.getDoctorReviewStats(doctorId);
    } catch (_) {
      // Fallback: compute minimal stats client-side if endpoint not available
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + (r as any).rating, 0) / totalReviews
        : 0;
      const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach((r: any) => {
        const rating = Math.max(1, Math.min(5, Number(r.rating) || 0));
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
      stats = {
        totalReviews,
        averageRating,
        ratingDistribution,
        analysis: {
          topFeedback: {},
          commonKeywords: [],
          sentiment: 'neutral'
        }
      } as ReviewsStats;
    }
    return { reviews, stats };
  }
);

export const fetchPatientReviews = createAsyncThunk(
  'review/fetchPatientReviews',
  async (patientId: number) => {
    const reviews = await reviewApi.getPatientReviews(patientId);
    return reviews;
  }
);

export const createReview = createAsyncThunk(
  'review/createReview',
  async (
    reviewData: {
      doctorId: number;
      rating: number;
      comment?: string;
      appointmentId?: number;
    }
  ) => {
    const created = await reviewApi.createReview(reviewData as any);
    return created;
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (id: number) => {
    await reviewApi.deleteReview(id);
    return id;
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.stats = action.payload.stats;
      })
      .addCase(fetchDoctorReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      // Patient reviews
      .addCase(fetchPatientReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload as Review[];
        state.stats = null;
      })
      .addCase(fetchPatientReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch patient reviews';
      })
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.reviews.unshift(action.payload as unknown as Review);
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create review';
      })
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        const idToRemove = action.payload as unknown as number;
        // @ts-ignore - ids may be string/number depending on backend; coerce to string for compare
        state.reviews = state.reviews.filter(r => String(r.id) !== String(idToRemove));
      });
  },
});

export default reviewSlice.reducer;