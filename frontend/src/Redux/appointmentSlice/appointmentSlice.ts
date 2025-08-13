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
  page?: number;
  limit?: number;
  total?: number;
}

const initialState: AppointmentState = {
  appointments: [],
  loading: false,
  error: null,
  selectedAppointment: null,
  filters: {},
  page: 1,
  limit: 50,
  total: 0,
};


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
  async (doctorId: number, { getState }) => {
    const state = getState() as any;
    const page = state.appointment?.page || 1;
    const limit = state.appointment?.limit || 50;
    const response = await appointmentApi.getAppointmentsByDoctor(doctorId, page, limit);
    return response.data;
  }
);

export const fetchAppointmentsByPatient = createAsyncThunk(
  'appointment/fetchAppointmentsByPatient',
  async (patientId: number, { getState }) => {
    const state = getState() as any;
    const page = state.appointment?.page || 1;
    const limit = state.appointment?.limit || 50;
    const response = await appointmentApi.getAppointmentsByPatient(patientId, page, limit);
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
      state.selectedAppointment = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<AppointmentState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload > 0 ? action.payload : 1;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload > 0 ? action.payload : state.limit;
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
        state.appointments = action.payload?.data || [];
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
        state.appointments = action.payload?.data || [];
        if (action.payload?.pagination) {
          state.page = action.payload.pagination.page;
          state.limit = action.payload.pagination.limit;
          state.total = action.payload.pagination.total;
        }
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
        state.appointments = action.payload?.data || [];
        if (action.payload?.pagination) {
          state.page = action.payload.pagination.page;
          state.limit = action.payload.pagination.limit;
          state.total = action.payload.pagination.total;
        }
      })
      .addCase(fetchAppointmentsByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch patient appointments';
      })
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload?.data?.data) {
          state.appointments.unshift(action.payload.data.data);
        } else {
          // no-op
        }
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create appointment';
      })
      // Update status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        if (action.payload?.data?.data) {
          const index = state.appointments.findIndex(apt => apt.id === action.payload.data.data.id);
          if (index !== -1) {
            state.appointments[index] = action.payload.data.data;
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
  setPage,
  setLimit,
  addAppointment,
  updateAppointment,
  removeAppointment,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
