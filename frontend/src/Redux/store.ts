import { configureStore } from '@reduxjs/toolkit';
// Import other reducers here

export const store = configureStore({
  reducer: {
    // Add other reducers here
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, ...}
export type AppDispatch = typeof store.dispatch;
