import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../slices/authSlice";
import userReducer from "../slices/userSlice";
import { authApi } from "../apiSlices/authApi";
import { userApi } from "../apiSlices/userApi";
import { departmentApi } from "../apiSlices/departmentApi";
import { facultyApi } from "../apiSlices/facultyApi";
import { scholarApi } from "../apiSlices/scholarApi";
import { drcMeetingApi } from "../apiSlices/drcMeetingApi";
import { notificationApi } from "../apiSlices/notificationApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [facultyApi.reducerPath]: facultyApi.reducer,
    [scholarApi.reducerPath]: scholarApi.reducer,
    [drcMeetingApi.reducerPath]: drcMeetingApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      departmentApi.middleware,
      facultyApi.middleware,
      scholarApi.middleware,
      drcMeetingApi.middleware,
      notificationApi.middleware
    ),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export default store;
