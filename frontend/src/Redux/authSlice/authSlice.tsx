// frontend/src/Redux/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserLite {
  id: number | string;
  email: string;
  role?: string | null;
  createdAt?: string | null;
}

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
});

export const { setAuth, clearAuth, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
