import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Review } from '../../types/data/review';
import * as reviewApi from '../../Api/review.api';

export interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  selectedReview: Review | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
  selectedReview: null,
};

// Async thunks
export const fetchDoctorReviews = createAsyncThunk(
  'review/fetchDoctorReviews',
  async (doctorId: number) => {
    const response = await reviewApi.getDoctorReviews(doctorId);
    return response.data?.data || [];
  }
);

export const fetchPatientReviews = createAsyncThunk(
  'review/fetchPatientReviews',
  async (patientId: number) => {
    const response = await reviewApi.getPatientReviews(patientId);
    return response.data?.data || [];
  }
);

export const createReview = createAsyncThunk(
  'review/createReview',
  async (reviewData: {
    doctorId: number;
    rating: number;
    comment: string;
    appointmentId?: number;
  }) => {
    const response = await reviewApi.createReview(reviewData);
    return response.data?.data;
  }
);

export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ id, data }: { id: number; data: Partial<Review> }) => {
    const response = await reviewApi.updateReview(id, data);
    return response.data?.data;
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
  reducers: {
    setSelectedReview: (state, action: PayloadAction<Review | null>) => {
      state.selectedReview = action.payload;
    },
    addReview: (state, action: PayloadAction<Review>) => {
      state.reviews.unshift(action.payload);
    },
    updateReviewInState: (state, action: PayloadAction<Review>) => {
      const index = state.reviews.findIndex(review => review.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
    },
    removeReview: (state, action: PayloadAction<number>) => {
      state.reviews = state.reviews.filter(review => review.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch doctor reviews
      .addCase(fetchDoctorReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchDoctorReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      // Create review
      .addCase(createReview.fulfilled, (state, action) => {
        if (action.payload) {
          state.reviews.unshift(action.payload);
        }
      })
      // Update review
      .addCase(updateReview.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.reviews.findIndex(review => review.id === action.payload.id);
          if (index !== -1) {
            state.reviews[index] = action.payload;
          }
        }
      })
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(review => review.id !== action.payload);
      });
  },
});

export const {
  setSelectedReview,
  addReview,
  updateReviewInState,
  removeReview,
} = reviewSlice.actions;

export default reviewSlice.reducer;
