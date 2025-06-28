import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearUserState: (state) => {
      state.users = [];
      state.selectedUser = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setUsers,
  setSelectedUser,
  setLoading,
  setError,
  clearUserState,
} = userSlice.actions;

export default userSlice.reducer;
