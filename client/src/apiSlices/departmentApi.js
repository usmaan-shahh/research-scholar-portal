import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const departmentApi = createApi({
  reducerPath: "departmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/departments",
    credentials: "include",
  }),
  tagTypes: ["Department"],
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: () => "/",
      providesTags: (result = [], error, arg) => [
        "Department",
        ...result.map(({ _id }) => ({ type: "Department", id: _id })),
      ],
    }),
    getDepartmentById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Department", id }],
    }),
    createDepartment: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Department"],
    }),
    updateDepartment: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Department",
        { type: "Department", id },
      ],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "Department",
        { type: "Department", id },
      ],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;
