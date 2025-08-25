import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const scholarAccountApi = createApi({
  reducerPath: "scholarAccountApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/auth",
    credentials: "include",
  }),
  tagTypes: ["ScholarAccount"],
  endpoints: (builder) => ({
    createScholarAccount: builder.mutation({
      query: (scholarData) => ({
        url: "/create-scholar-account",
        method: "POST",
        body: scholarData,
      }),
      invalidatesTags: ["ScholarAccount"],
    }),
  }),
});

export const { useCreateScholarAccountMutation } = scholarAccountApi;
