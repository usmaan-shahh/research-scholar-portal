import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  FaUserGraduate,
  FaUserTie,
  FaUniversity,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetScholarsQuery } from "../../apiSlices/scholarApi";
import { useGetFacultyByUserIdQuery } from "../../apiSlices/facultyApi";
import FacultyScholarCard from "./FacultyScholarCard";
import NotificationDropdown from "../notifications/NotificationDropdown";
import LogoutButton from "../common/LogoutButton";

const TABS = {
  SUPERVISION: "Supervision",
  PROFILE: "Profile",
};

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState(TABS.SUPERVISION);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const { user } = useSelector((state) => state.auth);

  // Verify user has correct role for Faculty Dashboard
  const hasCorrectRole = useMemo(() => {
    return user?.role === "supervisor";
  }, [user?.role]);

  // Get faculty record for the logged-in user
  const {
    data: facultyData,
    isLoading: facultyLoading,
    error: facultyError,
  } = useGetFacultyByUserIdQuery(user?._id, {
    skip: !hasCorrectRole || !user?._id,
  });

  // Get scholars supervised by this faculty member
  const {
    data: scholars = [],
    isLoading: scholarsLoading,
    error: scholarsError,
    refetch: refetchScholars,
  } = useGetScholarsQuery(
    hasCorrectRole && facultyData?._id
      ? { supervisor: facultyData._id }
      : undefined,
    {
      skip: !hasCorrectRole || !facultyData?._id,
    }
  );

  // Filter and sort scholars
  const filteredAndSortedScholars = useMemo(() => {
    let filtered = scholars;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (scholar) =>
          scholar.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scholar.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scholar.regId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((scholar) => {
        if (statusFilter === "active") return scholar.isActive;
        if (statusFilter === "inactive") return !scholar.isActive;
        if (statusFilter === "with-synopsis") return scholar.synopsisTitle;
        if (statusFilter === "without-synopsis") return !scholar.synopsisTitle;
        return true;
      });
    }

    // Create a copy of the filtered array before sorting to avoid mutating the original
    const sortedFiltered = [...filtered];

    // Apply sorting
    sortedFiltered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "rollNo":
          return (a.rollNo || "").localeCompare(b.rollNo || "");
        case "dateOfAdmission":
          return new Date(b.dateOfAdmission) - new Date(a.dateOfAdmission);
        case "dateOfJoining":
          return new Date(b.dateOfJoining) - new Date(a.dateOfJoining);
        default:
          return 0;
      }
    });

    return sortedFiltered;
  }, [scholars, searchTerm, statusFilter, sortBy]);

  // Calculate supervision statistics
  const supervisionStats = useMemo(() => {
    const total = scholars.length;
    const active = scholars.filter((s) => s.isActive).length;
    const inactive = total - active;
    const withSynopsis = scholars.filter((s) => s.synopsisTitle).length;
    const withoutSynopsis = total - withSynopsis;
    const withCoSupervisor = scholars.filter((s) => s.coSupervisor).length;
    const withoutCoSupervisor = total - withCoSupervisor;

    return {
      total,
      active,
      inactive,
      withSynopsis,
      withoutSynopsis,
      withCoSupervisor,
      withoutCoSupervisor,
    };
  }, [scholars]);

  if (!hasCorrectRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access the Faculty Dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching faculty data
  if (facultyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty information...</p>
        </div>
      </div>
    );
  }

  // Show error state if faculty data failed to load
  if (facultyError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Faculty Data
          </h1>
          <p className="text-gray-600 mb-4">
            {facultyError.data?.message ||
              facultyError.message ||
              "Failed to load faculty information"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show message if no faculty record found
  if (!facultyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Faculty Record Not Found
          </h1>
          <p className="text-gray-600">
            No faculty record found for your user account. Please contact the
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Faculty Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back,{" "}
                <span className="font-semibold">{facultyData.name}</span>
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FaUniversity className="w-4 h-4" />
                  {facultyData.departmentCode}
                </span>
                <span className="flex items-center gap-1">
                  <FaUserTie className="w-4 h-4" />
                  {facultyData.designation}
                </span>
                <span className="flex items-center gap-1">
                  <FaUserGraduate className="w-4 h-4" />
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <button
                onClick={() => refetchScholars()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUserGraduate className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Scholars
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {supervisionStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaUserTie className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Scholars
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {supervisionStats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaCalendarAlt className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Co-Supervisors
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {supervisionStats.withCoSupervisor}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-0 border-b border-gray-200">
          {Object.values(TABS).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-semibold transition-all duration-200 text-base relative ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === TABS.SUPERVISION && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                My Supervised Scholars
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search scholars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="with-synopsis">With Synopsis</option>
                  <option value="without-synopsis">Without Synopsis</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="rollNo">Sort by Roll No</option>
                  <option value="dateOfAdmission">
                    Sort by Admission Date
                  </option>
                  <option value="dateOfJoining">Sort by Joining Date</option>
                </select>
              </div>
            </div>

            {/* Scholars Grid */}
            {scholarsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : scholarsError ? (
              <div className="text-center py-12 text-red-500">
                <p className="text-lg font-semibold">Error loading scholars</p>
                <p className="text-sm">
                  {scholarsError.data?.message ||
                    scholarsError.message ||
                    "Failed to load scholars data"}
                </p>
              </div>
            ) : filteredAndSortedScholars.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaUserGraduate className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No scholars found</p>
                <p className="text-sm">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "You don't have any assigned scholars yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedScholars.map((scholar) => (
                  <FacultyScholarCard
                    key={scholar._id}
                    scholar={scholar}
                    onRefresh={refetchScholars}
                  />
                ))}
              </div>
            )}

            {/* Results Summary */}
            {filteredAndSortedScholars.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Showing {filteredAndSortedScholars.length} of{" "}
                  {scholars.length} scholars
                  {searchTerm && ` matching "${searchTerm}"`}
                  {statusFilter !== "all" && ` (${statusFilter} status)`}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === TABS.PROFILE && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              My Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="text-lg text-gray-900">{facultyData.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Employee Code
                  </label>
                  <p className="text-lg text-gray-900">
                    {facultyData.employeeCode}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <p className="text-lg text-gray-900">
                    {facultyData.departmentCode}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Designation
                  </label>
                  <p className="text-lg text-gray-900 capitalize">
                    {facultyData.designation}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supervision Capacity
                  </label>
                  <p className="text-lg text-gray-900">
                    {scholars.length} / {facultyData.maxScholars}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Active Scholars
                  </label>
                  <p className="text-lg text-gray-900">
                    {supervisionStats.active}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PhD Status
                  </label>
                  <p
                    className={`text-lg font-semibold ${
                      facultyData.isPhD ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {facultyData.isPhD ? "PhD Holder" : "No PhD"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Publications
                  </label>
                  <p className="text-lg text-gray-900">
                    {facultyData.numberOfPublications}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
