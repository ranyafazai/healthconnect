import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Appointment } from '../../types/state/appointment';
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

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointment/fetchAppointments',
  async () => {
    const response = await appointmentApi.getAppointments();
    return response.data?.data || [];
  }
);

export const fetchAppointmentsByDoctor = createAsyncThunk(
  'appointment/fetchAppointmentsByDoctor',
  async (doctorId: number) => {
    const response = await appointmentApi.getAppointmentsByDoctor(doctorId);
    return response.data?.data || [];
  }
);

export const fetchAppointmentsByPatient = createAsyncThunk(
  'appointment/fetchAppointmentsByPatient',
  async (patientId: number) => {
    const response = await appointmentApi.getAppointmentsByPatient(patientId);
    return response.data?.data || [];
  }
);

export const createAppointment = createAsyncThunk(
  'appointment/createAppointment',
  async (appointmentData: Parameters<typeof appointmentApi.createAppointment>[0]) => {
    const response = await appointmentApi.createAppointment(appointmentData);
    return response.data?.data;
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointment/updateStatus',
  async ({ id, status }: { id: number; status: string }) => {
    const response = await appointmentApi.updateAppointmentStatus(id, status);
    return response.data?.data;
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
      state.selectedAppointment = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<AppointmentState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.unshift(action.payload);
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    removeAppointment: (state, action: PayloadAction<number>) => {
      state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch appointments';
      })
      // Fetch by doctor
      .addCase(fetchAppointmentsByDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsByDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsByDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch doctor appointments';
      })
      // Fetch by patient
      .addCase(fetchAppointmentsByPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch patient appointments';
      })
      // Create appointment
      .addCase(createAppointment.fulfilled, (state, action) => {
        if (action.payload) {
          state.appointments.unshift(action.payload);
        }
      })
      // Update status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
          if (index !== -1) {
            state.appointments[index] = action.payload;
          }
        }
      })
      // Delete appointment
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
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
