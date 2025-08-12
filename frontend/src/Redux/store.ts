// frontend/src/Redux/store.ts
/* eslint-disable import/named */
// @ts-ignore - Some tooling falsely flags named import; Redux Toolkit v2 exports it
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { saveStateToStorage } from "./authSlice/authSlice";
import chatReducer from "./chatSlice/chatSlice";
import appointmentReducer from "./appointmentSlice/appointmentSlice";
import doctorReducer from "./doctorSlice/doctorSlice";
import patientReducer from "./patientSlice/patientSlice";
import reviewReducer from "./reviewSlice/reviewSlice";
import notificationReducer from "./notificationSlice/notificationSlice";
import userReducer from "./userSlice/userSlice";
import userSettingsReducer from "./userSettingsSlice/userSettingsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    appointment: appointmentReducer,
    doctor: doctorReducer,
    patient: patientReducer,
    review: reviewReducer,
    notification: notificationReducer,
    user: userReducer,
    userSettings: userSettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Subscribe to store changes and save auth state to localStorage
// Only save when auth state actually changes to prevent excessive localStorage operations
let previousAuthState: string | null = null;

store.subscribe(() => {
  const state = store.getState();
  const currentAuthState = JSON.stringify(state.auth);
  
  // Only save to localStorage if auth state has actually changed
  if (previousAuthState !== currentAuthState) {
    saveStateToStorage(state.auth);
    previousAuthState = currentAuthState;
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
