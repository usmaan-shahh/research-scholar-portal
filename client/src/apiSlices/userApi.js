import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: "/users",
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => {
        console.log("API Response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("API Error:", response);
        return response;
      },
      providesTags: ["User"],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: userData,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    // Main Office User APIs
    createMainOfficeUser: builder.mutation({
      query: ({ departmentCode, tempPassword }) => ({
        url: "/users/main-office",
        method: "POST",
        body: { departmentCode, tempPassword },
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    resetMainOfficePassword: builder.mutation({
      query: ({ departmentCode, tempPassword }) => ({
        url: "/users/main-office/reset-password",
        method: "POST",
        body: { departmentCode, tempPassword },
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: "/auth/change-password",
        method: "POST",
        body: { currentPassword, newPassword },
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateMainOfficeUserMutation,
  useResetMainOfficePasswordMutation,
  useChangePasswordMutation,
} = userApi;
