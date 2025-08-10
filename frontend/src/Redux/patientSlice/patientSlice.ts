import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { PatientProfile } from '../../types/data/patient';
import * as patientApi from '../../Api/patient.api';

export interface PatientState {
  patient: PatientProfile | null;
  loading: boolean;
  error: string | null;
  dashboardData: any;
}

const initialState: PatientState = {
  patient: null,
  loading: false,
  error: null,
  dashboardData: null,
};

// Async thunks
export const fetchPatientProfile = createAsyncThunk(
  'patient/fetchProfile',
  async (id: number) => {
    const response = await patientApi.getPatientById(id);
    return response.data?.data;
  }
);

export const fetchPatientDashboard = createAsyncThunk(
  'patient/fetchDashboard',
  async () => {
    const response = await patientApi.getPatientDashboard();
    return response.data?.data;
  }
);

export const createPatientProfile = createAsyncThunk(
  'patient/createProfile',
  async (profileData: Partial<PatientProfile>) => {
    const response = await patientApi.createPatientProfile(profileData);
    return response.data?.data;
  }
);

export const updatePatientProfile = createAsyncThunk(
  'patient/updateProfile',
  async ({ id, data }: { id: number; data: Partial<PatientProfile> }) => {
    const response = await patientApi.updatePatientProfile(id, data);
    return response.data?.data;
  }
);

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setPatient: (state, action: PayloadAction<PatientProfile | null>) => {
      state.patient = action.payload;
    },
    clearPatient: (state) => {
      state.patient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchPatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.patient = action.payload;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch patient profile';
      })
      // Fetch dashboard
      .addCase(fetchPatientDashboard.fulfilled, (state, action) => {
        state.dashboardData = action.payload;
      })
      // Create profile
      .addCase(createPatientProfile.fulfilled, (state, action) => {
        if (action.payload) {
          state.patient = action.payload;
        }
      })
      // Update profile
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        if (action.payload) {
          state.patient = action.payload;
        }
      });
  },
});

export const {
  setPatient,
  clearPatient,
} = patientSlice.actions;

export default patientSlice.reducer;
