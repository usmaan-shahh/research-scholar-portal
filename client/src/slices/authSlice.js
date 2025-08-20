import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload;
      state.isAuthenticated = true;
    },
    updateUserField: (state, { payload }) => {
      if (state.user) {
        state.user = { ...state.user, ...payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, updateUserField, logout } = authSlice.actions;
export default authSlice.reducer;
