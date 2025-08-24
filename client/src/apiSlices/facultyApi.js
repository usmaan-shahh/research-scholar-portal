import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const facultyApi = createApi({
  reducerPath: "facultyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/faculties",
    credentials: "include",
  }),
  tagTypes: ["Faculty"],
  endpoints: (builder) => ({
    getFacultyByUserId: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: "Faculty", id: userId }],
    }),
    getFaculties: builder.query({
      query: (params) => ({
        url: "/",
        params,
      }),
      providesTags: ["Faculty"],
    }),
    getFacultyById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Faculty", id }],
    }),
    getFacultyWithSupervisionLoad: builder.query({
      query: (params) => ({
        url: "/supervision-load",
        params,
      }),
      providesTags: ["Faculty"],
    }),
    createFaculty: builder.mutation({
      query: (faculty) => ({
        url: "/",
        method: "POST",
        body: faculty,
      }),
      invalidatesTags: ["Faculty"],
    }),
    createFacultyAccount: builder.mutation({
      query: (accountData) => ({
        url: "/create-account",
        method: "POST",
        body: accountData,
      }),
      invalidatesTags: ["Faculty"],
    }),
    updateFaculty: builder.mutation({
      query: ({ id, ...faculty }) => ({
        url: `/${id}`,
        method: "PUT",
        body: faculty,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Faculty", id },
        "Faculty",
      ],
    }),
    deleteFaculty: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Faculty"],
    }),
  }),
});

export const {
  useGetFacultyByUserIdQuery,
  useGetFacultiesQuery,
  useGetFacultyByIdQuery,
  useGetFacultyWithSupervisionLoadQuery,
  useCreateFacultyMutation,
  useCreateFacultyAccountMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
} = facultyApi;
