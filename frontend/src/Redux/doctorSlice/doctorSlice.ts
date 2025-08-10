import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { DoctorProfile } from '../../types/data/doctor';
import * as doctorApi from '../../Api/doctor.api';

export interface DoctorState {
  doctors: DoctorProfile[];
  selectedDoctor: DoctorProfile | null;
  loading: boolean;
  error: string | null;
  dashboardData: any;
  filters: {
    specialization?: string;
    rating?: number;
    availability?: string;
    city?: string;
    state?: string;
  };
}

const initialState: DoctorState = {
  doctors: [],
  selectedDoctor: null,
  loading: false,
  error: null,
  dashboardData: null,
  filters: {},
};

// Async thunks
export const fetchAllDoctors = createAsyncThunk(
  'doctor/fetchAllDoctors',
  async () => {
    const response = await doctorApi.getAllDoctors();
    return response.data?.data || [];
  }
);

export const fetchDoctorById = createAsyncThunk(
  'doctor/fetchDoctorById',
  async (id: number) => {
    const response = await doctorApi.getDoctorById(id);
    return response.data?.data;
  }
);

export const fetchDoctorDashboard = createAsyncThunk(
  'doctor/fetchDashboard',
  async () => {
    const response = await doctorApi.getDoctorDashboard();
    return response.data?.data;
  }
);

export const searchDoctors = createAsyncThunk(
  'doctor/searchDoctors',
  async (filters: DoctorState['filters']) => {
    const response = await doctorApi.searchDoctors(filters);
    return response.data?.data || [];
  }
);

export const createDoctorProfile = createAsyncThunk(
  'doctor/createProfile',
  async (profileData: Partial<DoctorProfile>) => {
    const response = await doctorApi.createDoctorProfile(profileData);
    return response.data?.data;
  }
);

export const updateDoctorProfile = createAsyncThunk(
  'doctor/updateProfile',
  async ({ id, data }: { id: number; data: Partial<DoctorProfile> }) => {
    const response = await doctorApi.updateDoctorProfile(id, data);
    return response.data?.data;
  }
);

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    setSelectedDoctor: (state, action: PayloadAction<DoctorProfile | null>) => {
      state.selectedDoctor = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<DoctorState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    addDoctor: (state, action: PayloadAction<DoctorProfile>) => {
      state.doctors.unshift(action.payload);
    },
    updateDoctor: (state, action: PayloadAction<DoctorProfile>) => {
      const index = state.doctors.findIndex(doc => doc.id === action.payload.id);
      if (index !== -1) {
        state.doctors[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all doctors
      .addCase(fetchAllDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch doctors';
      })
      // Fetch by ID
      .addCase(fetchDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDoctor = action.payload;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch doctor';
      })
      // Fetch dashboard
      .addCase(fetchDoctorDashboard.fulfilled, (state, action) => {
        state.dashboardData = action.payload;
      })
      // Search doctors
      .addCase(searchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(searchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search doctors';
      })
      // Create profile
      .addCase(createDoctorProfile.fulfilled, (state, action) => {
        if (action.payload) {
          state.doctors.unshift(action.payload);
        }
      })
      // Update profile
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.doctors.findIndex(doc => doc.id === action.payload.id);
          if (index !== -1) {
            state.doctors[index] = action.payload;
          }
          if (state.selectedDoctor?.id === action.payload.id) {
            state.selectedDoctor = action.payload;
          }
        }
      });
  },
});

export const {
  setSelectedDoctor,
  setFilters,
  clearFilters,
  addDoctor,
  updateDoctor,
} = doctorSlice.actions;

export default doctorSlice.reducer;
