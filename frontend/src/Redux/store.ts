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

// Debug logs removed for production readiness

// Subscribe to store changes and save auth state to localStorage
store.subscribe(() => {
  const state = store.getState();
  saveStateToStorage(state.auth);
  
  // Persist minimal auth state only
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
