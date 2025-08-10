import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { UserLite } from "../../types/user";
import { getMe } from "../../Api/auth.api";

interface LocalAuthState {
  isAuthenticated: boolean;
  user: UserLite | null;  
  loading: boolean;
  error: string | null;
}

// Load initial state from localStorage
const loadState = (): LocalAuthState => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    };
  }
};

const initialState: LocalAuthState = loadState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<UserLite>) {
      console.log('Redux: Setting auth state:', action.payload);
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      // Clear localStorage when logging out
      localStorage.removeItem('authState');
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
        // Clear localStorage if authentication check fails
        localStorage.removeItem('authState');
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

// Save state to localStorage whenever it changes
export const saveStateToStorage = (state: LocalAuthState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('authState', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

export const { setAuth, clearAuth, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
