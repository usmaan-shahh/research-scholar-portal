import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const scholarApi = createApi({
  reducerPath: "scholarApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/scholars",
    credentials: "include",
  }),
  tagTypes: ["Scholar"],
  endpoints: (builder) => ({
    getScholars: builder.query({
      query: (params) => ({
        url: "/",
        params,
      }),
      providesTags: ["Scholar"],
    }),
    getScholarsCount: builder.query({
      query: (params) => ({
        url: "/count",
        params,
      }),
      providesTags: ["Scholar"],
    }),
    getScholarById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Scholar", id }],
    }),
    createScholar: builder.mutation({
      query: (scholar) => ({
        url: "/",
        method: "POST",
        body: scholar,
      }),
      invalidatesTags: ["Scholar"],
    }),
    updateScholar: builder.mutation({
      query: ({ id, ...scholar }) => ({
        url: `/${id}`,
        method: "PUT",
        body: scholar,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Scholar", id },
        "Scholar",
      ],
    }),
    deleteScholar: builder.mutation({
      query: ({ id, permanent = false }) => ({
        url: `/${id}?permanent=${permanent}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Scholar"],
    }),
    createUserAccountForExistingScholar: builder.mutation({
      query: (data) => ({
        url: "/create-user-account",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Scholar"],
    }),
  }),
});

export const {
  useGetScholarsQuery,
  useGetScholarsCountQuery,
  useGetScholarByIdQuery,
  useCreateScholarMutation,
  useUpdateScholarMutation,
  useDeleteScholarMutation,
  useCreateUserAccountForExistingScholarMutation,
} = scholarApi;
