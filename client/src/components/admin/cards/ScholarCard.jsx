import React, { useState } from "react";
import { HiPencil, HiTrash, HiEye, HiAcademicCap } from "react-icons/hi";

const ScholarCard = ({
  scholar,
  faculties,
  onEdit,
  onDelete,
  onSupervisorAssignment = null,
  userRole = "",
  showSupervisorAssignments = false,
}) => {
  const [showProfile, setShowProfile] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getSupervisorName = (supervisorId) => {
    if (!supervisorId) return "N/A";
    const faculty = faculties.find((f) => f._id === supervisorId);
    return faculty ? `${faculty.name} (${faculty.designation})` : "Unknown";
  };

  const getCoSupervisorName = (coSupervisorId) => {
    if (!coSupervisorId) return "N/A";
    const faculty = faculties.find((f) => f._id === coSupervisorId);
    return faculty ? `${faculty.name} (${faculty.designation})` : "Unknown";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <HiAcademicCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{scholar.name}</h3>
              <p className="text-blue-100 text-sm">{scholar.rollNo}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                scholar.isActive
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {scholar.isActive ? "Active" : "Inactive"}
            </span>

            {/* Supervisor Assignment Status */}
            {showSupervisorAssignments && (
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                  scholar.supervisor
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                }`}
              >
                {scholar.supervisor
                  ? "Supervisor Assigned"
                  : "Pending Assignment"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Basic Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Email:</span>
            <span
              className="font-medium truncate max-w-[200px]"
              title={scholar.email}
            >
              {scholar.email}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{scholar.phone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Reg ID:</span>
            <span className="font-medium">{scholar.regId}</span>
          </div>
        </div>

        {/* Academic Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">PG Degree:</span>
            <span className="font-medium">{scholar.pgDegree}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">PG CGPA:</span>
            <span className="font-medium">{scholar.pgCgpa}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">BG Degree:</span>
            <span className="font-medium">{scholar.bgDegree}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">BG CGPA:</span>
            <span className="font-medium">{scholar.bgCgpa}</span>
          </div>
        </div>

        {/* Research Info */}
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-gray-600">Research Area:</span>
            <p className="font-medium text-gray-800 mt-1 line-clamp-2">
              {scholar.areaOfResearch}
            </p>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Synopsis Title:</span>
            <p className="font-medium text-gray-800 mt-1 line-clamp-2">
              {scholar.synopsisTitle}
            </p>
          </div>
        </div>

        {/* Supervisor Info */}
        <div
          className={`space-y-2 ${
            showSupervisorAssignments
              ? "bg-blue-50 p-3 rounded-lg border border-blue-200"
              : ""
          }`}
        >
          <div className="text-sm">
            <span className="text-gray-600">Supervisor:</span>
            <p
              className={`font-medium mt-1 ${
                scholar.supervisor ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {scholar.supervisor
                ? getSupervisorName(
                    scholar.supervisor._id || scholar.supervisor
                  )
                : "Not assigned"}
            </p>

            {/* Show supervision load info for assigned supervisor */}
            {showSupervisorAssignments &&
              scholar.supervisor &&
              (() => {
                const supervisor = faculties.find(
                  (f) =>
                    f._id === (scholar.supervisor._id || scholar.supervisor)
                );
                if (!supervisor?.supervisionLoad) return null;

                const { capacityStatus, currentLoad, maxCapacity } =
                  supervisor.supervisionLoad;
                let statusColor, statusBg;

                switch (capacityStatus?.severity) {
                  case "error":
                    statusColor = "text-red-600";
                    statusBg = "bg-red-100";
                    break;
                  case "warning":
                    statusColor = "text-yellow-600";
                    statusBg = "bg-yellow-100";
                    break;
                  default:
                    statusColor = "text-green-600";
                    statusBg = "bg-green-100";
                }

                return (
                  <div className={`mt-2 p-2 rounded text-xs ${statusBg}`}>
                    <div className="flex items-center justify-between">
                      <span className={statusColor}>
                        Load: {currentLoad}/{maxCapacity}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${statusColor} ${statusBg} border`}
                      >
                        {capacityStatus?.status === "full"
                          ? "Full"
                          : capacityStatus?.status === "near_limit"
                          ? "Near Limit"
                          : "Available"}
                      </span>
                    </div>
                  </div>
                );
              })()}
          </div>

          {scholar.coSupervisor && (
            <div className="text-sm">
              <span className="text-gray-600">Co-Supervisor:</span>
              <p className="font-medium text-gray-800 mt-1">
                {getCoSupervisorName(
                  scholar.coSupervisor._id || scholar.coSupervisor
                )}
              </p>
            </div>
          )}

          {/* Quick Assignment Button */}
          {showSupervisorAssignments && onSupervisorAssignment && (
            <div className="pt-2">
              <button
                onClick={() => onSupervisorAssignment(scholar)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scholar.supervisor
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-yellow-600 text-white hover:bg-yellow-700"
                }`}
              >
                {scholar.supervisor ? "Change Supervisor" : "Assign Supervisor"}
              </button>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Admission:</span>
            <span className="font-medium">
              {formatDate(scholar.dateOfAdmission)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Joining:</span>
            <span className="font-medium">
              {formatDate(scholar.dateOfJoining)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            <HiEye className="w-4 h-4" />
            <span>{showProfile ? "Hide" : "View"} Profile</span>
          </button>
          <div className="flex space-x-2">
            {/* Supervisor Assignment Button for DRC Chair */}
            {userRole === "drc_chair" && onSupervisorAssignment && (
              <button
                onClick={() => onSupervisorAssignment(scholar)}
                className={`p-2 rounded-lg transition-colors ${
                  scholar.supervisor
                    ? "text-green-600 hover:bg-green-50"
                    : "text-yellow-600 hover:bg-yellow-50"
                }`}
                title={
                  scholar.supervisor ? "Change Supervisor" : "Assign Supervisor"
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={() => onEdit(scholar)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Scholar"
            >
              <HiPencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(scholar._id, false)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Deactivate Scholar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Profile View */}
      {showProfile && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-3">
          <div className="text-sm">
            <span className="text-gray-600 font-medium">Address:</span>
            <p className="text-gray-800 mt-1">{scholar.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Department:</span>
              <p className="text-gray-800 mt-1">{scholar.departmentCode}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Created:</span>
              <p className="text-gray-800 mt-1">
                {formatDate(scholar.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarCard;
