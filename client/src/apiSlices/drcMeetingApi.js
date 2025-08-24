import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const drcMeetingApi = createApi({
  reducerPath: "drcMeetingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["DRCMeeting"],
  endpoints: (builder) => ({
    // Get all meetings with filtering
    getMeetings: builder.query({
      query: (params) => ({
        url: "/drc-meetings",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.meetings.map(({ _id }) => ({
                type: "DRCMeeting",
                id: _id,
              })),
              { type: "DRCMeeting", id: "LIST" },
            ]
          : [{ type: "DRCMeeting", id: "LIST" }],
    }),

    // Get meeting by ID
    getMeetingById: builder.query({
      query: (id) => `/drc-meetings/${id}`,
      providesTags: (result, error, id) => [{ type: "DRCMeeting", id }],
    }),

    // Get meeting statistics
    getMeetingStats: builder.query({
      query: (params) => ({
        url: "/drc-meetings/stats",
        params,
      }),
      providesTags: ["DRCMeeting"],
    }),

    // Create new meeting
    createMeeting: builder.mutation({
      query: (meetingData) => ({
        url: "/drc-meetings",
        method: "POST",
        body: meetingData,
      }),
      invalidatesTags: [{ type: "DRCMeeting", id: "LIST" }],
    }),

    // Update meeting
    updateMeeting: builder.mutation({
      query: ({ id, ...meetingData }) => ({
        url: `/drc-meetings/${id}`,
        method: "PUT",
        body: meetingData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DRCMeeting", id },
        { type: "DRCMeeting", id: "LIST" },
      ],
    }),

    // Delete/Cancel meeting
    deleteMeeting: builder.mutation({
      query: ({ id, permanent = false }) => ({
        url: `/drc-meetings/${id}?permanent=${permanent}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "DRCMeeting", id: "LIST" }],
    }),

    // Upload meeting minutes
    uploadMinutes: builder.mutation({
      query: ({ id, minutesFile }) => {
        const formData = new FormData();
        formData.append("minutes", minutesFile);

        return {
          url: `/drc-meetings/${id}/upload-minutes`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary
          headers: {
            // Remove any default headers that might interfere with file upload
          },
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "DRCMeeting", id },
        { type: "DRCMeeting", id: "LIST" },
      ],
    }),

    // Download meeting minutes
    downloadMinutes: builder.mutation({
      query: (id) => ({
        url: `/drc-meetings/${id}/download-minutes`,
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `meeting-minutes-${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return { success: true };
        },
      }),
    }),
  }),
});

export const {
  useGetMeetingsQuery,
  useGetMeetingByIdQuery,
  useGetMeetingStatsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
  useUploadMinutesMutation,
  useDownloadMinutesMutation,
} = drcMeetingApi;
