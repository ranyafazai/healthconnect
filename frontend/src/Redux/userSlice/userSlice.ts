import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/data/user';
import * as userApi from '../../Api/user.api';

export interface UserState {
  profile: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async () => {
    const response = await userApi.getUserProfile();
    return response.data?.data;
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUserProfile(profileData);
      return response.data?.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to update profile';
      return rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData: { currentPassword: string; newPassword: string }) => {
    await userApi.changePassword(passwordData);
  }
);

export const uploadProfilePhoto = createAsyncThunk(
  'user/uploadPhoto',
  async (file: File) => {
    const response = await userApi.uploadProfilePhoto(file);
    return response.data?.data?.photoUrl;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<User | null>) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    updateProfilePhoto: (_state, _action: PayloadAction<string>) => {
      // Photo URL will be stored in the files array or handled by the backend
      // This is just for optimistic UI updates
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user profile';
      })
      // Update profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (action.payload) {
          state.profile = action.payload;
        }
      })
      // Upload photo
      .addCase(uploadProfilePhoto.fulfilled, (_state, _action) => {
        // Photo URL will be handled by the backend and reflected in the files array
        // This is just for optimistic UI updates
      });
  },
});

export const {
  setProfile,
  clearProfile,
  updateProfilePhoto,
} = userSlice.actions;

export default userSlice.reducer;
