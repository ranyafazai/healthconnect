import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Appointment } from '../../types/data/appointment';
import type { AppointmentStatus } from '../../types/data/appointment';
import * as appointmentApi from '../../Api/appointment.api';

export interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  selectedAppointment: Appointment | null;
  filters: {
    status?: string;
    type?: 'TEXT' | 'VIDEO';
    date?: string;
  };
}

const initialState: AppointmentState = {
  appointments: [],
  loading: false,
  error: null,
  selectedAppointment: null,
  filters: {},
};

// Debug initial state
console.log('Appointment slice initial state:', initialState);

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointment/fetchAppointments',
  async () => {
    const response = await appointmentApi.getAppointments();
    return response.data;
  }
);

export const fetchAppointmentsByDoctor = createAsyncThunk(
  'appointment/fetchAppointmentsByDoctor',
  async (doctorId: number) => {
    const response = await appointmentApi.getAppointmentsByDoctor(doctorId);
    return response.data;
  }
);

export const fetchAppointmentsByPatient = createAsyncThunk(
  'appointment/fetchAppointmentsByPatient',
  async (patientId: number) => {
    const response = await appointmentApi.getAppointmentsByPatient(patientId);
    console.log('fetchAppointmentsByPatient response:', response);
    console.log('fetchAppointmentsByPatient response.data:', response.data);
    console.log('fetchAppointmentsByPatient response.data.data:', response.data.data);
    return response.data;
  }
);

export const createAppointment = createAsyncThunk(
  'appointment/createAppointment',
  async (appointmentData: Parameters<typeof appointmentApi.createAppointment>[0]) => {
    const response =  await appointmentApi.createAppointment(appointmentData);
    return response.data;
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointment/updateStatus',
  async ({ id, status }: { id: number; status: AppointmentStatus }) => {
    const response = await appointmentApi.updateAppointmentStatus(id, status);
    return response.data;
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointment/deleteAppointment',
  async (id: number) => {
    await appointmentApi.deleteAppointment(id);
    return id;
  }
);

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setSelectedAppointment: (state, action: PayloadAction<Appointment | null>) => {
      console.log('setSelectedAppointment reducer - action.payload:', action.payload);
      console.log('setSelectedAppointment reducer - state before update:', { ...state });
      state.selectedAppointment = action.payload;
      console.log('setSelectedAppointment reducer - state after update:', { ...state });
    },
    setFilters: (state, action: PayloadAction<Partial<AppointmentState['filters']>>) => {
      console.log('setFilters reducer - action.payload:', action.payload);
      console.log('setFilters reducer - state before update:', { ...state });
      state.filters = { ...state.filters, ...action.payload };
      console.log('setFilters reducer - state after update:', { ...state });
    },
    clearFilters: (state) => {
      console.log('clearFilters reducer - state before update:', { ...state });
      state.filters = {};
      console.log('clearFilters reducer - state after update:', { ...state });
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      console.log('addAppointment reducer - action.payload:', action.payload);
      console.log('addAppointment reducer - state before update:', { ...state });
      state.appointments.unshift(action.payload);
      console.log('addAppointment reducer - state after update:', { ...state });
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      console.log('updateAppointment reducer - action.payload:', action.payload);
      console.log('updateAppointment reducer - state before update:', { ...state });
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
      console.log('updateAppointment reducer - state after update:', { ...state });
    },
    removeAppointment: (state, action: PayloadAction<number>) => {
      console.log('removeAppointment reducer - action.payload:', action.payload);
      console.log('removeAppointment reducer - state before update:', { ...state });
      state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
      console.log('removeAppointment reducer - state after update:', { ...state });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        console.log('fetchAppointments.pending - state before update:', { ...state });
        state.loading = true;
        state.error = null;
        console.log('fetchAppointments.pending - state after update:', { ...state });
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        console.log('fetchAppointments.fulfilled - action.payload:', action.payload);
        console.log('fetchAppointments.fulfilled - state before update:', { ...state });
        state.loading = false;
        state.appointments = action.payload?.data || [];
        console.log('fetchAppointments.fulfilled - state after update:', { ...state });
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        console.log('fetchAppointments.rejected - error:', action.error);
        console.log('fetchAppointments.rejected - state before update:', { ...state });
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch appointments';
        console.log('fetchAppointments.rejected - state after update:', { ...state });
      })
      // Fetch by doctor
      .addCase(fetchAppointmentsByDoctor.pending, (state) => {
        console.log('fetchAppointmentsByDoctor.pending - state before update:', { ...state });
        state.loading = true;
        state.error = null;
        console.log('fetchAppointmentsByDoctor.pending - state after update:', { ...state });
      })
      .addCase(fetchAppointmentsByDoctor.fulfilled, (state, action) => {
        console.log('fetchAppointmentsByDoctor.fulfilled - action.payload:', action.payload);
        console.log('fetchAppointmentsByDoctor.fulfilled - state before update:', { ...state });
        state.loading = false;
        state.appointments = action.payload?.data || [];
        console.log('fetchAppointmentsByDoctor.fulfilled - state after update:', { ...state });
      })
      .addCase(fetchAppointmentsByDoctor.rejected, (state, action) => {
        console.log('fetchAppointmentsByDoctor.rejected - error:', action.error);
        console.log('fetchAppointmentsByDoctor.rejected - state before update:', { ...state });
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch doctor appointments';
        console.log('fetchAppointmentsByDoctor.rejected - state after update:', { ...state });
      })
      // Fetch by patient
      .addCase(fetchAppointmentsByPatient.pending, (state) => {
        console.log('fetchAppointmentsByPatient.pending - state before update:', { ...state });
        state.loading = true;
        state.error = null;
        console.log('fetchAppointmentsByPatient.pending - state after update:', { ...state });
      })
      .addCase(fetchAppointmentsByPatient.fulfilled, (state, action) => {
        console.log('fetchAppointmentsByPatient.fulfilled - action.payload:', action.payload);
        console.log('fetchAppointmentsByPatient.fulfilled - action.payload type:', typeof action.payload);
        console.log('fetchAppointmentsByPatient.fulfilled - state before update:', { ...state });
        state.loading = false;
        state.appointments = action.payload?.data || [];
        console.log('fetchAppointmentsByPatient.fulfilled - state.appointments after update:', state.appointments);
        console.log('fetchAppointments.fulfilled - state after update:', { ...state });
      })
      .addCase(fetchAppointmentsByPatient.rejected, (state, action) => {
        console.log('fetchAppointmentsByPatient.rejected - error:', action.error);
        console.log('fetchAppointmentsByPatient.rejected - state before update:', { ...state });
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch patient appointments';
        console.log('fetchAppointmentsByPatient.rejected - state after update:', { ...state });
      })
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        console.log('createAppointment.pending - state before update:', { ...state });
        state.loading = true;
        state.error = null;
        console.log('createAppointment.pending - state after update:', { ...state });
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        console.log('createAppointment.fulfilled - action.payload:', action.payload);
        console.log('createAppointment.fulfilled - action.payload.data:', action.payload?.data);
        console.log('createAppointment.fulfilled - state before update:', { ...state });
        state.loading = false;
        state.error = null;
        if (action.payload?.data?.data) {
          state.appointments.unshift(action.payload.data.data);
          console.log('Appointment added to state:', action.payload.data.data);
        } else {
          console.warn('No appointment data found in payload:', action.payload);
        }
        console.log('createAppointment.fulfilled - state after update:', { ...state });
      })
      .addCase(createAppointment.rejected, (state, action) => {
        console.log('createAppointment.rejected - error:', action.error);
        console.log('createAppointment.rejected - state before update:', { ...state });
        state.loading = false;
        state.error = action.error.message || 'Failed to create appointment';
        console.log('createAppointment.rejected - state after update:', { ...state });
      })
      // Update status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        console.log('updateAppointmentStatus.fulfilled - action.payload:', action.payload);
        console.log('updateAppointmentStatus.fulfilled - state before update:', { ...state });
        if (action.payload?.data?.data) {
          const index = state.appointments.findIndex(apt => apt.id === action.payload.data.data.id);
          if (index !== -1) {
            state.appointments[index] = action.payload.data.data;
          }
        }
        console.log('updateAppointmentStatus.fulfilled - state after update:', { ...state });
      })
      // Delete appointment
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        console.log('deleteAppointment.fulfilled - action.payload:', action.payload);
        console.log('deleteAppointment.fulfilled - state before update:', { ...state });
        state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
        console.log('deleteAppointment.fulfilled - state after update:', { ...state });
      });
  },
});

export const {
  setSelectedAppointment,
  setFilters,
  clearFilters,
  addAppointment,
  updateAppointment,
  removeAppointment,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
