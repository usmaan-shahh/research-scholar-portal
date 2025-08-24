import React, { useState, useMemo, useRef } from "react";
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

  const hasCorrectRole = useMemo(() => {
    return user?.role === "drc_chair";
  }, [user?.role]);

  const departmentCode = useMemo(() => {
    return user?.departmentCode || user?.department || "";
  }, [user?.departmentCode, user?.department]);

  const queryParams = useMemo(
    () => ({
      departmentCode: departmentCode,
      isActive: true,
    }),
    [departmentCode]
  );

  const {
    data: scholars = [],
    isLoading: scholarsLoading,
    error: scholarsError,
    refetch: refetchScholars,
  } = useGetScholarsQuery(departmentCode ? queryParams : undefined);

  const { data: meetingsStats = {}, isLoading: meetingsStatsLoading } =
    useGetMeetingStatsQuery(departmentCode ? { departmentCode } : undefined);

  const totalScholars = scholars.length;
  const scholarsWithSupervisor = scholars.filter(
    (scholar) => scholar.supervisor
  ).length;
  const scholarsWithoutSupervisor = totalScholars - scholarsWithSupervisor;

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
    refetchScholars();
    if (refreshFacultiesRef.current) {
      refreshFacultiesRef.current();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
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
            <div className="bg-orange-100 p-3 rounded-full">
              <FaCalendarAlt className="text-orange-600 text-xl" />
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
            <div className="bg-indigo-100 p-3 rounded-full">
              <FaCalendarAlt className="text-indigo-600 text-xl" />
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

      <div className="mb-8">
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

      <div className="max-w-7xl mx-auto">
        {activeTab === TABS.SCHOLARS_AND_ASSIGNMENTS && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Scholars & Supervisor Assignments
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleRefreshFaculties}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </div>

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
            ) : (
              <ScholarsSection
                title="Scholars & Assignments"
                lockedDepartmentCode={departmentCode}
                hideFilters={true}
                userRole={user?.role}
                onSupervisorAssignment={handleSupervisorAssignment}
                refreshFacultiesRef={refreshFacultiesRef}
              />
            )}
          </div>
        )}

        {activeTab === TABS.MEETINGS && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              DRC Meetings Management
            </h2>
            <DRCMeetingsDashboard
              departmentCode={departmentCode}
              userRole={user?.role}
            />
          </div>
        )}
      </div>

      {showSupervisorModal && selectedScholar && (
        <SupervisorAssignmentModal
          scholar={selectedScholar}
          onClose={() => setShowSupervisorModal(false)}
          onUpdate={handleSupervisorUpdate}
          refreshFacultiesRef={refreshFacultiesRef}
        />
      )}
    </div>
  );
};

export default DRCChairDashboard;
