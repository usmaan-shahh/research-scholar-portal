import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  HiCalendar,
  HiPlus,
  HiSearch,
  HiFilter,
  HiRefresh,
  HiEye,
  HiPencil,
  HiTrash,
} from "react-icons/hi";

import MeetingCard from "./MeetingCard";
import MeetingForm from "./MeetingForm";
import MeetingDetailsModal from "./MeetingDetailsModal";
import {
  useGetMeetingsQuery,
  useGetMeetingStatsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
  useUploadMinutesMutation,
  useDownloadMinutesMutation,
} from "../../apiSlices/drcMeetingApi";
import { useGetFacultiesQuery } from "../../apiSlices/facultyApi";
import { useGetDepartmentsQuery } from "../../apiSlices/departmentApi";

const DRCMeetingsDashboard = ({ departmentCode, userRole }) => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    meetingType: "",
    startDate: "",
    endDate: "",
  });

  const {
    data: meetingsData,
    isLoading,
    error,
    refetch,
  } = useGetMeetingsQuery({
    departmentCode: departmentCode || user?.departmentCode,
    ...filters,
  });

  const { data: statsData } = useGetMeetingStatsQuery({
    departmentCode: departmentCode || user?.departmentCode,
  });

  const { data: faculties = [] } = useGetFacultiesQuery({
    departmentCode: departmentCode || user?.departmentCode,
  });

  const { data: departments = [] } = useGetDepartmentsQuery();

  const [createMeeting] = useCreateMeetingMutation();
  const [updateMeeting] = useUpdateMeetingMutation();
  const [deleteMeeting] = useDeleteMeetingMutation();
  const [uploadMinutes] = useUploadMinutesMutation();
  const [downloadMinutes] = useDownloadMinutesMutation();

  const meetings = meetingsData?.meetings || [];
  const stats = statsData?.summary || {};
  const canEdit =
    userRole === "admin" ||
    userRole === "drc_chair" ||
    user?.role === "admin" ||
    user?.role === "drc_chair";

  const filteredMeetings = useMemo(() => {
    if (!meetings.length) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (activeTab) {
      case "upcoming":
        return meetings.filter(
          (m) => m.status === "scheduled" && new Date(m.date) >= today
        );
      case "previous":
        return meetings.filter(
          (m) =>
            m.status === "completed" ||
            (m.status === "scheduled" && new Date(m.date) < today)
        );
      case "cancelled":
        return meetings.filter((m) => m.status === "cancelled");
      default:
        return meetings;
    }
  }, [meetings, activeTab]);

  const handleCreateMeeting = async (meetingData) => {
    try {
      await createMeeting({
        ...meetingData,
        departmentCode: departmentCode || user?.departmentCode,
      }).unwrap();
      setShowForm(false);
      toast.success("Meeting created successfully!");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to create meeting");
    }
  };

  const handleUpdateMeeting = async (meetingData) => {
    try {
      // Ensure the meeting ID is included for updates
      const updateData = {
        id: editingMeeting._id,
        ...meetingData,
      };

      console.log("Updating meeting with data:", updateData);

      await updateMeeting(updateData).unwrap();
      setEditingMeeting(null);
      toast.success("Meeting updated successfully!");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to update meeting");
    }
  };

  const handleDeleteMeeting = async (meetingId, permanent = false) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        await deleteMeeting({ id: meetingId, permanent }).unwrap();
        toast.success("Meeting deleted successfully!");
        refetch();
      } catch (error) {
        toast.error(error.data?.message || "Failed to delete meeting");
      }
    }
  };

  const handleUploadMinutes = async (meetingId, file) => {
    try {
      await uploadMinutes({ id: meetingId, minutesFile: file }).unwrap();
      toast.success("Minutes uploaded successfully!");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to upload minutes");
    }
  };

  const handleDownloadMinutes = async (meetingId) => {
    try {
      const response = await downloadMinutes(meetingId).unwrap();
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meeting-minutes-${meetingId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download minutes");
    }
  };

  const handleViewDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetails(true);
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMeeting(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedMeeting(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      meetingType: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">DRC Meetings</h2>
          <p className="text-gray-600">
            Manage and track DRC meetings for your department
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiPlus className="w-5 h-5 mr-2" />
            New Meeting
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <HiCalendar className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Meetings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalMeetings || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <HiCalendar className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.upcomingMeetings || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <HiCalendar className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedMeetings || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <HiCalendar className="text-orange-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.cancelledMeetings || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "upcoming"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("previous")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "previous"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setActiveTab("cancelled")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "cancelled"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Cancelled
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={refetch}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh"
              >
                <HiRefresh className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.meetingType}
              onChange={(e) =>
                handleFilterChange("meetingType", e.target.value)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="synopsis">Synopsis</option>
              <option value="thesis">Thesis</option>
              <option value="other">Other</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-lg font-semibold">Error loading meetings</p>
              <p className="text-sm">
                {error.data?.message ||
                  error.message ||
                  "Failed to load meetings"}
              </p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <HiCalendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No meetings found</p>
              <p className="text-sm">
                {filters.search || filters.status || filters.meetingType
                  ? "Try adjusting your filters"
                  : `No ${activeTab} meetings available`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting._id}
                  meeting={meeting}
                  onViewDetails={() => handleViewDetails(meeting)}
                  onEdit={canEdit ? () => handleEdit(meeting) : undefined}
                  onDelete={
                    canEdit
                      ? (meetingId) => handleDeleteMeeting(meetingId)
                      : undefined
                  }
                  onUploadMinutes={
                    canEdit
                      ? (file) => handleUploadMinutes(meeting._id, file)
                      : undefined
                  }
                  onDownloadMinutes={() => handleDownloadMinutes(meeting._id)}
                  canEdit={canEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <MeetingForm
          meeting={editingMeeting}
          faculties={faculties}
          departments={departments}
          onSubmit={editingMeeting ? handleUpdateMeeting : handleCreateMeeting}
          onClose={handleCloseForm}
        />
      )}

      {showDetails && selectedMeeting && (
        <MeetingDetailsModal
          meeting={selectedMeeting}
          onClose={handleCloseDetails}
          onEdit={() => {
            setShowDetails(false);
            setEditingMeeting(selectedMeeting);
            setShowForm(true);
          }}
          onDelete={(meetingId) => {
            setShowDetails(false);
            handleDeleteMeeting(meetingId);
          }}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};

export default DRCMeetingsDashboard;
