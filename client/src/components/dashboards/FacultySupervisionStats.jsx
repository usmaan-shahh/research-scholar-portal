import React, { useMemo } from "react";
import {
  FaUserGraduate,
  FaChartLine,
  FaCalendarAlt,
  FaUniversity,
  FaBook,
  FaUserTie,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { HiAcademicCap, HiStatusOnline, HiStatusOffline } from "react-icons/hi";

const FacultySupervisionStats = ({ scholars, supervisionStats }) => {
  // Calculate additional statistics
  const additionalStats = useMemo(() => {
    if (!scholars.length) return {};

    // Calculate average CGPA
    const pgCgpas = scholars.filter((s) => s.pgCgpa).map((s) => s.pgCgpa);
    const bgCgpas = scholars.filter((s) => s.bgCgpa).map((s) => s.bgCgpa);

    const avgPgCgpa = pgCgpas.length
      ? (pgCgpas.reduce((a, b) => a + b, 0) / pgCgpas.length).toFixed(2)
      : "N/A";
    const avgBgCgpa = bgCgpas.length
      ? (bgCgpas.reduce((a, b) => a + b, 0) / bgCgpas.length).toFixed(2)
      : "N/A";

    // Calculate research areas distribution
    const researchAreas = scholars
      .filter((s) => s.areaOfResearch)
      .map((s) => s.areaOfResearch);
    const uniqueResearchAreas = [...new Set(researchAreas)];

    // Calculate admission year distribution
    const admissionYears = scholars
      .filter((s) => s.dateOfAdmission)
      .map((s) => new Date(s.dateOfAdmission).getFullYear());
    const yearDistribution = admissionYears.reduce((acc, year) => {
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    // Calculate progress distribution
    const progressDistribution = {
      beginner: scholars.filter((s) => s.isActive && !s.areaOfResearch).length,
      progress: scholars.filter(
        (s) => s.isActive && s.areaOfResearch && !s.synopsisTitle
      ).length,
      advanced: scholars.filter((s) => s.isActive && s.synopsisTitle).length,
      inactive: scholars.filter((s) => !s.isActive).length,
    };

    return {
      avgPgCgpa,
      avgBgCgpa,
      uniqueResearchAreas,
      yearDistribution,
      progressDistribution,
    };
  }, [scholars]);

  // Format year distribution for display
  const formatYearDistribution = (yearDistribution) => {
    return Object.entries(yearDistribution)
      .sort(([a], [b]) => b - a)
      .map(([year, count]) => `${year}: ${count}`)
      .join(", ");
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Supervision Statistics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overview Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FaChartLine className="w-5 h-5 mr-2 text-blue-500" />
            Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Total Scholars
              </span>
              <span className="text-lg font-bold text-blue-600">
                {supervisionStats.total}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Active Scholars
              </span>
              <span className="text-lg font-bold text-green-600">
                {supervisionStats.active}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                With Synopsis
              </span>
              <span className="text-lg font-bold text-purple-600">
                {supervisionStats.withSynopsis}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                With Co-Supervisor
              </span>
              <span className="text-lg font-bold text-orange-600">
                {supervisionStats.withCoSupervisor}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Performance */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <HiAcademicCap className="w-5 h-5 mr-2 text-indigo-500" />
            Academic Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Average PG CGPA
              </span>
              <span className="text-lg font-bold text-indigo-600">
                {additionalStats.avgPgCgpa}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Average BG CGPA
              </span>
              <span className="text-lg font-bold text-indigo-600">
                {additionalStats.avgBgCgpa}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Research Areas
              </span>
              <span className="text-lg font-bold text-indigo-600">
                {additionalStats.uniqueResearchAreas?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Distribution */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <FaUserGraduate className="w-5 h-5 mr-2 text-green-500" />
          Progress Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {additionalStats.progressDistribution?.beginner || 0}
            </div>
            <div className="text-sm text-yellow-700 font-medium">Beginner</div>
            <div className="text-xs text-yellow-600 mt-1">
              {supervisionStats.total > 0
                ? Math.round(
                    ((additionalStats.progressDistribution?.beginner || 0) /
                      supervisionStats.total) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {additionalStats.progressDistribution?.progress || 0}
            </div>
            <div className="text-sm text-blue-700 font-medium">In Progress</div>
            <div className="text-xs text-blue-600 mt-1">
              {supervisionStats.total > 0
                ? Math.round(
                    ((additionalStats.progressDistribution?.progress || 0) /
                      supervisionStats.total) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {additionalStats.progressDistribution?.advanced || 0}
            </div>
            <div className="text-sm text-green-700 font-medium">Advanced</div>
            <div className="text-xs text-green-600 mt-1">
              {supervisionStats.total > 0
                ? Math.round(
                    ((additionalStats.progressDistribution?.advanced || 0) /
                      supervisionStats.total) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {additionalStats.progressDistribution?.inactive || 0}
            </div>
            <div className="text-sm text-red-700 font-medium">Inactive</div>
            <div className="text-xs text-red-600 mt-1">
              {supervisionStats.total > 0
                ? Math.round(
                    ((additionalStats.progressDistribution?.inactive || 0) /
                      supervisionStats.total) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Research Areas and Year Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Research Areas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FaBook className="w-5 h-5 mr-2 text-purple-500" />
            Research Areas
          </h3>
          {additionalStats.uniqueResearchAreas?.length > 0 ? (
            <div className="space-y-2">
              {additionalStats.uniqueResearchAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{area}</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {scholars.filter((s) => s.areaOfResearch === area).length}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaBook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No research areas defined yet</p>
            </div>
          )}
        </div>

        {/* Year Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FaCalendarAlt className="w-5 h-5 mr-2 text-orange-500" />
            Admission Year Distribution
          </h3>
          {Object.keys(additionalStats.yearDistribution || {}).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(additionalStats.yearDistribution || {})
                .sort(([a], [b]) => b - a)
                .map(([year, count]) => (
                  <div
                    key={year}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{year}</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaCalendarAlt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No admission data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Export Report
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            Schedule Meeting
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
            View Calendar
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
            Send Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultySupervisionStats;
