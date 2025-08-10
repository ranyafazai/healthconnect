// frontend/src/Redux/store.ts
/* eslint-disable import/named */
// @ts-ignore - Some tooling falsely flags named import; Redux Toolkit v2 exports it
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice/authSlice";
import chatReducer from "./chatSlice/chatSlice";

// Add more reducers as your app grows
export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
