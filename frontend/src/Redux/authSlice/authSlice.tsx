import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { UserLite } from "../../types/user";
import { getMe, logout } from "../../Api/auth.api";

interface LocalAuthState {
  isAuthenticated: boolean;
  user: UserLite | null;  
  loading: boolean;
  error: string | null;
}

const initialState: LocalAuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<UserLite>) {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if logout fails on backend, clear local state
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      });
  },
});

// Async thunk to check authentication status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMe();
      return response.data.user;
    } catch (error) {
      return rejectWithValue('Authentication failed');
    }
  }
);

// Async thunk to logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logout();
      return true;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const { setAuth, clearAuth, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
