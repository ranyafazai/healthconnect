import { createAsyncThunk } from '@reduxjs/toolkit';
import * as doctorApi from '../../Api/doctor.api';
import type { DoctorProfile } from '../../types/data/doctor';

export const updateDoctorProfileThunk = createAsyncThunk(
  'doctor/updateProfileByLocation',
  async ({ id, data }: { id: number; data: Partial<DoctorProfile> }) => {
    const response = await doctorApi.updateDoctorProfile(id, data);
    return response.data?.data;
  }
);


