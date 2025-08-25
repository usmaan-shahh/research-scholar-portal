import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  FaUniversity,
  FaUserGraduate,
  FaUserTie,
  FaExchangeAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetScholarsQuery } from "../../apiSlices/scholarApi";
import { useGetMeetingStatsQuery } from "../../apiSlices/drcMeetingApi";
import ScholarsSection from "../admin/sections/ScholarsSection";
import SupervisorAssignmentModal from "../admin/modals/SupervisorAssignmentModal";
import DRCMeetingsDashboard from "../drc-meetings/DRCMeetingsDashboard";
import NotificationDropdown from "../notifications/NotificationDropdown";
import LogoutButton from "../common/LogoutButton";

const TABS = {
  SCHOLARS_AND_ASSIGNMENTS: "Scholars & Assignments",
  MEETINGS: "Meetings",
};

const DRCChairDashboard = () => {
  const [activeTab, setActiveTab] = useState(TABS.SCHOLARS_AND_ASSIGNMENTS);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [selectedScholar, setSelectedScholar] = useState(null);
  const refreshFacultiesRef = useRef(null);

  const { user } = useSelector((state) => state.auth);

  // Verify user has correct role for DRC Chair Dashboard
  const hasCorrectRole = useMemo(() => {
    return user?.role === "drc_chair";
  }, [user?.role]);

  // Extract department code from user object - prefer departmentCode field, fallback to department field
  const departmentCode = useMemo(() => {
    const code = user?.departmentCode || user?.department || "";
    console.log("=== DRC Chair Dashboard Debug ===");
    console.log("User object:", user);
    console.log("User role:", user?.role);
    console.log("Has correct role:", hasCorrectRole);
    console.log("Department Code field:", user?.departmentCode);
    console.log("Department field:", user?.department);
    console.log("Username:", user?.username);
    console.log("Extracted department code:", code);
    console.log("Is authenticated:", user ? "Yes" : "No");
    console.log("================================");
    return code;
  }, [user?.departmentCode, user?.department, hasCorrectRole]);

  // Memoize query parameters to prevent infinite requests
  const queryParams = useMemo(
    () => ({
      departmentCode: departmentCode,
      isActive: true,
    }),
    [departmentCode]
  );

  // Get scholars data for statistics - only when departmentCode is available
  const {
    data: scholars = [],
    isLoading: scholarsLoading,
    error: scholarsError,
    refetch: refetchScholars,
  } = useGetScholarsQuery(departmentCode ? queryParams : undefined);

  // Get meetings statistics
  const { data: meetingsStats = {}, isLoading: meetingsStatsLoading } =
    useGetMeetingStatsQuery(departmentCode ? { departmentCode } : undefined);

  // Debug API call details
  useEffect(() => {
    if (departmentCode) {
      console.log("=== API Call Debug ===");
      console.log("Making API call with params:", queryParams);
      console.log("Department Code:", departmentCode);
      console.log("User Role:", user?.role);
      console.log("API Endpoint:", "http://localhost:5000/api/scholars/");
      console.log("=========================");
    }
  }, [departmentCode, queryParams, user?.role]);

  // Calculate statistics
  const totalScholars = scholars.length;
  const scholarsWithSupervisor = scholars.filter(
    (scholar) => scholar.supervisor
  ).length;
  const scholarsWithoutSupervisor = totalScholars - scholarsWithSupervisor;

  // Meetings statistics
  const totalMeetings = meetingsStats.totalMeetings || 0;
  const upcomingMeetings = meetingsStats.upcomingMeetings || 0;
  const completedMeetings = meetingsStats.completedMeetings || 0;

  const handleSupervisorAssignment = (scholar) => {
    setSelectedScholar(scholar);
    setShowSupervisorModal(true);
  };

  const handleSupervisorUpdate = () => {
    setShowSupervisorModal(false);
    setSelectedScholar(null);
    toast.success("Supervisor assignment updated successfully!");
  };

  const handleRefreshFaculties = () => {
    // Refresh both scholars and faculty data
    refetchScholars();
    if (refreshFacultiesRef.current) {
      refreshFacultiesRef.current();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white rounded-full p-3 shadow">
            <FaUniversity size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-800">
              DRC Chair Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Department:{" "}
              {departmentCode ||
                (scholarsLoading ? "Loading..." : "Not available")}{" "}
              | Welcome,{" "}
              {user?.name ||
                user?.username ||
                (scholarsLoading ? "Loading..." : "Not available")}
              {user?.role && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Role: {user.role}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationDropdown />
          <LogoutButton variant="outline" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUserGraduate className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Scholars
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {scholarsLoading ? "..." : totalScholars}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <FaUserTie className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Assigned Supervisors
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {scholarsLoading ? "..." : scholarsWithSupervisor}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaExchangeAlt className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Assignments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {scholarsLoading ? "..." : scholarsWithoutSupervisor}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaCalendarAlt className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Meetings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {meetingsStatsLoading ? "..." : totalMeetings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Upcoming Meetings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {meetingsStatsLoading ? "..." : upcomingMeetings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <FaCalendarAlt className="text-red-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Completed Meetings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {meetingsStatsLoading ? "..." : completedMeetings}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-0 border-b border-gray-200">
          {Object.values(TABS).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-semibold transition-all duration-200 text-base relative ${
                activeTab === tab
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50/50"
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
        {activeTab === TABS.SCHOLARS_AND_ASSIGNMENTS && departmentCode && (
          <ScholarsSection
            lockedDepartmentCode={departmentCode}
            hideFilters={false}
            title={`${departmentCode} Department Scholars & Assignments`}
            userRole="drc_chair"
            onSupervisorAssignment={handleSupervisorAssignment}
            showSupervisorAssignments={true}
            onRefreshFaculties={handleRefreshFaculties}
            refreshFacultiesRef={refreshFacultiesRef}
          />
        )}

        {activeTab === TABS.MEETINGS && departmentCode && (
          <DRCMeetingsDashboard
            departmentCode={departmentCode}
            onRefreshFaculties={handleRefreshFaculties}
            refreshFacultiesRef={refreshFacultiesRef}
          />
        )}

        {!departmentCode && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">
              {scholarsLoading
                ? "Loading department information..."
                : "Department information not available"}
            </p>
            <p className="text-sm">
              {scholarsLoading
                ? "Please wait while we load your department details."
                : "Please check your authentication status."}
            </p>
            {user && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-sm font-semibold">Debug Information:</p>
                <p className="text-xs">Role: {user.role || "Not set"}</p>
                <p className="text-xs">
                  Department: {user.department || "Not set"}
                </p>
                <p className="text-xs">
                  Department Code: {user.departmentCode || "Not set"}
                </p>
                <p className="text-xs">
                  Username: {user.username || "Not set"}
                </p>
                <p className="text-xs">Name: {user.name || "Not set"}</p>
              </div>
            )}
          </div>
        )}

        {scholarsError && (
          <div className="text-center py-12 text-red-500">
            <p className="text-lg font-semibold">Error loading scholars</p>
            <p className="text-sm">
              {scholarsError.data?.message ||
                scholarsError.message ||
                "Failed to load scholars data"}
            </p>
            <div className="mt-4 p-4 bg-red-50 rounded-lg text-left">
              <p className="text-xs font-semibold">Error Details:</p>
              <p className="text-xs">
                Status: {scholarsError.status || "Unknown"}
              </p>
              <p className="text-xs">
                Department Code: {departmentCode || "Not available"}
              </p>
              <p className="text-xs">
                User Role: {user?.role || "Not available"}
              </p>
              <p className="text-xs">
                User: {user?.username || "Not available"}
              </p>
              <p className="text-xs">API Endpoint: /api/scholars/</p>
              <p className="text-xs">
                Query Params: {JSON.stringify(queryParams)}
              </p>
              {scholarsError.data && (
                <p className="text-xs">
                  Server Response: {JSON.stringify(scholarsError.data)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Supervisor Assignment Modal */}
      {showSupervisorModal && (
        <SupervisorAssignmentModal
          scholar={selectedScholar}
          departmentCode={departmentCode}
          onClose={() => setShowSupervisorModal(false)}
          onSuccess={handleSupervisorUpdate}
          refreshFaculties={handleRefreshFaculties}
        />
      )}
    </div>
  );
};

export default DRCChairDashboard;
