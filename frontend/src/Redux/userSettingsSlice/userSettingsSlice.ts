import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserSettings, updateUserSettings, type UserSettings } from '../../Api/userSettings.api';

interface UserSettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
}

const initialState: UserSettingsState = {
  settings: null,
  loading: false,
  error: null,
  updating: false,
};

export const fetchUserSettings = createAsyncThunk(
  'userSettings/fetchUserSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserSettings();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user settings');
    }
  }
);

export const updateUserSettingsAsync = createAsyncThunk(
  'userSettings/updateUserSettings',
  async (settings: Partial<UserSettings>, { rejectWithValue }) => {
    try {
      const response = await updateUserSettings(settings);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user settings');
    }
  }
);

const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    clearUserSettings: (state) => {
      state.settings = null;
      state.error = null;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user settings
      .addCase(fetchUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user settings
      .addCase(updateUserSettingsAsync.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateUserSettingsAsync.fulfilled, (state, action) => {
        state.updating = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(updateUserSettingsAsync.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserSettings, resetError } = userSettingsSlice.actions;
export default userSettingsSlice.reducer;
