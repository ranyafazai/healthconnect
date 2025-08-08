// frontend/src/Redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice/authSlice";

// Add more reducers as your app grows
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
