import React, { useState, useEffect, useMemo } from "react";
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

const DRCMeetingsDashboard = () => {
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

  // API Queries
  const {
    data: meetingsData,
    isLoading,
    error,
    refetch,
  } = useGetMeetingsQuery({
    departmentCode: user?.departmentCode,
    ...filters,
  });

  const { data: statsData } = useGetMeetingStatsQuery({
    departmentCode: user?.departmentCode,
  });

  const { data: faculties = [] } = useGetFacultiesQuery({
    departmentCode: user?.departmentCode,
  });

  const { data: departments = [] } = useGetDepartmentsQuery();

  // API Mutations
  const [createMeeting] = useCreateMeetingMutation();
  const [updateMeeting] = useUpdateMeetingMutation();
  const [deleteMeeting] = useDeleteMeetingMutation();
  const [uploadMinutes] = useUploadMinutesMutation();
  const [downloadMinutes] = useDownloadMinutesMutation();

  // Computed values
  const meetings = meetingsData?.meetings || [];
  const stats = statsData?.summary || {};
  const canEdit = user?.role === "admin" || user?.role === "drc_chair";

  // Filter meetings based on active tab
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

  // Handle form submission
  const handleSubmitMeeting = async (formData) => {
    try {
      if (editingMeeting) {
        await updateMeeting({ id: editingMeeting._id, ...formData }).unwrap();
      } else {
        await createMeeting(formData).unwrap();
      }
      setShowForm(false);
      setEditingMeeting(null);
    } catch (error) {
      throw new Error(error.data?.message || "Failed to save meeting");
    }
  };

  // Handle meeting actions
  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setShowForm(true);
  };

  const handleDeleteMeeting = async (meetingId, permanent = false) => {
    try {
      await deleteMeeting({ id: meetingId, permanent }).unwrap();
      toast.success("Meeting deleted successfully");
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete meeting");
    }
  };

  const handleViewDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetails(true);
  };

  const handleUploadMinutes = async (meetingId, file) => {
    try {
      await uploadMinutes({ id: meetingId, minutesFile: file }).unwrap();
      toast.success("Meeting minutes uploaded successfully");
    } catch (error) {
      toast.error(error.data?.message || "Failed to upload minutes");
    }
  };

  const handleDownloadMinutes = async (meetingId) => {
    try {
      await downloadMinutes(meetingId).unwrap();
    } catch (error) {
      toast.error(error.data?.message || "Failed to download minutes");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      meetingType: "",
      startDate: "",
      endDate: "",
    });
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">Error loading meetings</div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DRC Meetings</h1>
              <p className="text-gray-600">
                Manage departmental research committee meetings
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <HiPlus className="w-5 h-5" />
                Schedule Meeting
              </button>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HiCalendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Meetings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <HiCalendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.scheduled || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HiCalendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.today || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <HiCalendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.upcoming || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <HiSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Meeting Type Filter */}
            <select
              value={filters.meetingType}
              onChange={(e) =>
                handleFilterChange("meetingType", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Monthly Review">Monthly Review</option>
              <option value="Thesis Defense">Thesis Defense</option>
              <option value="Research Discussion">Research Discussion</option>
              <option value="Policy Review">Policy Review</option>
              <option value="Other">Other</option>
            </select>

            {/* Start Date */}
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* End Date */}
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                {
                  key: "upcoming",
                  label: "Upcoming Meetings",
                  count: filteredMeetings.length,
                },
                {
                  key: "previous",
                  label: "Previous Meetings",
                  count: filteredMeetings.length,
                },
                {
                  key: "cancelled",
                  label: "Cancelled Meetings",
                  count: filteredMeetings.length,
                },
                { key: "all", label: "All Meetings", count: meetings.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Meetings Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meetings...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <HiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No meetings found
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === "upcoming"
                ? "No upcoming meetings scheduled"
                : activeTab === "previous"
                ? "No previous meetings found"
                : activeTab === "cancelled"
                ? "No cancelled meetings found"
                : "No meetings match your current filters"}
            </p>
            {canEdit && activeTab === "upcoming" && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Schedule First Meeting
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMeetings.map((meeting) => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
                faculties={faculties}
                onEdit={handleEditMeeting}
                onDelete={handleDeleteMeeting}
                onViewDetails={handleViewDetails}
                onUploadMinutes={handleUploadMinutes}
                onDownloadMinutes={handleDownloadMinutes}
                userRole={user?.role}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meetingsData?.pagination && meetingsData.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  refetch({ page: meetingsData.pagination.currentPage - 1 })
                }
                disabled={!meetingsData.pagination.hasPrev}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-3 py-2 text-sm text-gray-700">
                Page {meetingsData.pagination.currentPage} of{" "}
                {meetingsData.pagination.totalPages}
              </span>

              <button
                onClick={() =>
                  refetch({ page: meetingsData.pagination.currentPage + 1 })
                }
                disabled={!meetingsData.pagination.hasNext}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <MeetingForm
            meeting={editingMeeting}
            onSubmit={handleSubmitMeeting}
            onCancel={() => {
              setShowForm(false);
              setEditingMeeting(null);
            }}
            faculties={faculties}
            departments={departments}
            userRole={user?.role}
            userDepartmentCode={user?.departmentCode}
          />
        </div>
      )}

      {/* Meeting Details Modal */}
      {showDetails && selectedMeeting && (
        <MeetingDetailsModal
          meeting={selectedMeeting}
          onClose={() => {
            setShowDetails(false);
            setSelectedMeeting(null);
          }}
          onEdit={handleEditMeeting}
          onDelete={handleDeleteMeeting}
          onUploadMinutes={handleUploadMinutes}
          onDownloadMinutes={handleDownloadMinutes}
          userRole={user?.role}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};

export default DRCMeetingsDashboard;
