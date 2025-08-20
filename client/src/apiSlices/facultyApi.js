import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const facultyApi = createApi({
  reducerPath: "facultyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/faculties",
    credentials: "include",
  }),
  tagTypes: ["Faculty"],
  endpoints: (builder) => ({
    getFaculties: builder.query({
      query: (params) => {
        let queryStr = "/";
        if (params) {
          const q = new URLSearchParams(params).toString();
          if (q) queryStr += `?${q}`;
        }
        return queryStr;
      },
      providesTags: (result = [], error, arg) => [
        "Faculty",
        ...result.map(({ _id }) => ({ type: "Faculty", id: _id })),
      ],
    }),
    getFacultyById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Faculty", id }],
    }),
    createFaculty: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Faculty"],
    }),
    updateFaculty: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Faculty",
        { type: "Faculty", id },
      ],
    }),
    deleteFaculty: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "Faculty",
        { type: "Faculty", id },
      ],
    }),
  }),
});

export const {
  useGetFacultiesQuery,
  useGetFacultyByIdQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
} = facultyApi;
