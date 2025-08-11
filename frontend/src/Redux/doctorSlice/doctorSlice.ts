import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { DoctorProfile } from '../../types/data/doctor';
import * as doctorApi from '../../Api/doctor.api';

export interface DoctorState {
  doctors: DoctorProfile[];
  searchResults: DoctorProfile[];
  currentDoctor: DoctorProfile | null;
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  filters: {
    specialty: string;
    city: string;
    minRating: string;
    availability: string;
  };
  searchQuery: string;
  sortBy: string;
  dashboardData: {
    appointmentsToday: number;
    totalAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    avgRating: number;
    totalReviews: number;
    unreadMessages: number;
  } | null;
  dashboardLoading: boolean;
}

const initialState: DoctorState = {
  doctors: [],
  searchResults: [],
  currentDoctor: null,
  loading: false,
  searchLoading: false,
  error: null,
  filters: {
    specialty: 'All Specialties',
    city: 'All Cities',
    minRating: 'Any Rating',
    availability: 'Any Availability'
  },
  searchQuery: '',
  sortBy: 'Name A-Z',
  dashboardData: null,
  dashboardLoading: false
};

// Async thunks
export const fetchDoctors = createAsyncThunk(
  'doctor/fetchDoctors',
  async () => {
    const response = await doctorApi.getAllDoctors();
    return response.data?.data || [];
  }
);

export const searchDoctors = createAsyncThunk(
  'doctor/searchDoctors',
  async (params: {
    query?: string;
    specialty?: string;
    city?: string;
    minRating?: string;
    availability?: string;
    sortBy?: string;
  }) => {
    // Convert params to match API expectations
    const apiParams: {
      query?: string;
      specialization?: string;
      city?: string;
      rating?: number;
      availability?: string;
      sortBy?: string;
    } = {};
    
    if (params.query) {
      apiParams.query = params.query;
    }
    if (params.specialty && params.specialty !== 'All Specialties') {
      apiParams.specialization = params.specialty;
    }
    if (params.city && params.city !== 'All Cities') {
      apiParams.city = params.city;
    }
    if (params.minRating && params.minRating !== 'Any Rating') {
      const ratingValue = params.minRating.replace('+ Stars', '');
      apiParams.rating = parseFloat(ratingValue);
    }
    if (params.availability && params.availability !== 'Any Availability') {
      apiParams.availability = params.availability;
    }
    if (params.sortBy) {
      apiParams.sortBy = params.sortBy;
    }
    
    const response = await doctorApi.searchDoctors(apiParams);
    return response.data?.data || [];
  }
);

export const getDoctorById = createAsyncThunk(
  'doctor/getDoctorById',
  async (id: number) => {
    const response = await doctorApi.getDoctorById(id);
    return response.data?.data;
  }
);

export const fetchDoctorDashboard = createAsyncThunk(
  'doctor/fetchDoctorDashboard',
  async () => {
    const response = await doctorApi.getDoctorDashboard();
    return response.data?.data;
  }
);

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<DoctorState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
      state.sortBy = 'Name A-Z';
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch doctors';
      })
      // Search doctors
      .addCase(searchDoctors.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchDoctors.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchDoctors.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.error.message || 'Failed to search doctors';
      })
      // Get doctor by ID
      .addCase(getDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentDoctor = action.payload;
          const existingIndex = state.doctors.findIndex((d: DoctorProfile) => d.id === action.payload.id);
          if (existingIndex !== -1) {
            state.doctors[existingIndex] = action.payload;
          } else {
            state.doctors.push(action.payload);
          }
        }
      })
      .addCase(getDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch doctor';
      })
      // Fetch doctor dashboard
      .addCase(fetchDoctorDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDoctorDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      });
  },
});

export const {
  setFilters,
  setSearchQuery,
  setSortBy,
  clearFilters,
  clearSearchResults,
} = doctorSlice.actions;

export default doctorSlice.reducer;
