import React, { useState } from "react";
import {
  FaUserGraduate,
  FaCalendarAlt,
  FaUniversity,
  FaBook,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEye,
  FaEdit,
  FaChartLine,
} from "react-icons/fa";
import { HiAcademicCap, HiStatusOnline, HiStatusOffline } from "react-icons/hi";

const FacultyScholarCard = ({ scholar, onRefresh }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProgressStatus = () => {
    if (!scholar.isActive)
      return { status: "inactive", color: "red", text: "Inactive" };
    if (scholar.synopsisTitle)
      return { status: "advanced", color: "green", text: "Advanced" };
    if (scholar.areaOfResearch)
      return { status: "progress", color: "blue", text: "In Progress" };
    return { status: "beginner", color: "yellow", text: "Beginner" };
  };

  const progressStatus = getProgressStatus();

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative">
        <div
          className={`h-2 ${
            progressStatus.status === "inactive"
              ? "bg-red-500"
              : progressStatus.status === "advanced"
              ? "bg-green-500"
              : progressStatus.status === "progress"
              ? "bg-blue-500"
              : "bg-yellow-500"
          }`}
        ></div>
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              progressStatus.status === "inactive"
                ? "bg-red-100 text-red-800"
                : progressStatus.status === "advanced"
                ? "bg-green-100 text-green-800"
                : progressStatus.status === "progress"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {progressStatus.text}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                <FaUserGraduate className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 break-words">
                {scholar.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {scholar.rollNo}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                  {scholar.regId}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FaUniversity className="w-4 h-4 mr-2 text-blue-500" />
            <span className="font-medium">Department:</span>
            <span className="ml-1">{scholar.departmentCode}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="w-4 h-4 mr-2 text-green-500" />
            <span className="font-medium">Admitted:</span>
            <span className="ml-1">{formatDate(scholar.dateOfAdmission)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="w-4 h-4 mr-2 text-purple-500" />
            <span className="font-medium">Joined:</span>
            <span className="ml-1">{formatDate(scholar.dateOfJoining)}</span>
          </div>

          {scholar.pgDegree && (
            <div className="flex items-center text-sm text-gray-600">
              <HiAcademicCap className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="font-medium">PG Degree:</span>
              <span className="ml-1">
                {scholar.pgDegree} (CGPA: {scholar.pgCgpa})
              </span>
            </div>
          )}

          {scholar.bgDegree && (
            <div className="flex items-center text-sm text-gray-600">
              <HiAcademicCap className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="font-medium">BG Degree:</span>
              <span className="ml-1">
                {scholar.bgDegree} (CGPA: {scholar.bgCgpa})
              </span>
            </div>
          )}

          {scholar.areaOfResearch && (
            <div className="flex items-start text-sm text-gray-600">
              <FaChartLine className="w-4 h-4 mr-2 text-orange-500 mt-0.5" />
              <span className="font-medium">Research Area:</span>
              <span className="ml-1 break-words">{scholar.areaOfResearch}</span>
            </div>
          )}

          {scholar.synopsisTitle && (
            <div className="flex items-start text-sm text-gray-600">
              <FaBook className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
              <span className="font-medium">Synopsis:</span>
              <span className="ml-1 break-words">{scholar.synopsisTitle}</span>
            </div>
          )}
        </div>

        {(scholar.email || scholar.phone || scholar.address) && (
          <div className="border-t border-gray-100 pt-3 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Contact Information
            </h4>
            <div className="space-y-2">
              {scholar.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <FaEnvelope className="w-3 h-3 mr-2 text-blue-500" />
                  <span className="truncate">{scholar.email}</span>
                </div>
              )}
              {scholar.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <FaPhone className="w-3 h-3 mr-2 text-green-500" />
                  <span>{scholar.phone}</span>
                </div>
              )}
              {scholar.address && (
                <div className="flex items-start text-sm text-gray-600">
                  <FaMapMarkerAlt className="w-3 h-3 mr-2 text-red-500 mt-0.5" />
                  <span className="break-words">{scholar.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {scholar.coSupervisor && (
          <div className="border-t border-gray-100 pt-3 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Co-Supervisor
            </h4>
            <div className="flex items-center text-sm text-gray-600">
              <FaUserGraduate className="w-3 h-3 mr-2 text-purple-500" />
              <span>{scholar.coSupervisor.name || "Assigned"}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            {scholar.isActive ? (
              <span className="flex items-center text-green-600 font-semibold">
                <HiStatusOnline className="w-4 h-4 mr-1" /> Active
              </span>
            ) : (
              <span className="flex items-center text-gray-400 font-semibold">
                <HiStatusOffline className="w-4 h-4 mr-1" /> Inactive
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title={showDetails ? "Hide Details" : "Show Details"}
            >
              <FaEye className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Edit Scholar"
            >
              <FaEdit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Additional Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">
                Registration ID:
              </span>
              <p className="text-gray-900">{scholar.regId}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Roll Number:</span>
              <p className="text-gray-900">{scholar.rollNo}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Admission Date:</span>
              <p className="text-gray-900">
                {formatDate(scholar.dateOfAdmission)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Joining Date:</span>
              <p className="text-gray-900">
                {formatDate(scholar.dateOfJoining)}
              </p>
            </div>
            {scholar.pgDegree && (
              <div>
                <span className="font-medium text-gray-600">PG Degree:</span>
                <p className="text-gray-900">{scholar.pgDegree}</p>
              </div>
            )}
            {scholar.pgCgpa && (
              <div>
                <span className="font-medium text-gray-600">PG CGPA:</span>
                <p className="text-gray-900">{scholar.pgCgpa}</p>
              </div>
            )}
            {scholar.bgDegree && (
              <div>
                <span className="font-medium text-gray-600">BG Degree:</span>
                <p className="text-gray-900">{scholar.bgDegree}</p>
              </div>
            )}
            {scholar.bgCgpa && (
              <div>
                <span className="font-medium text-gray-600">BG CGPA:</span>
                <p className="text-gray-900">{scholar.bgCgpa}</p>
              </div>
            )}
          </div>

          {scholar.areaOfResearch && (
            <div className="mt-4">
              <span className="font-medium text-gray-600">Research Area:</span>
              <p className="text-gray-900 mt-1">{scholar.areaOfResearch}</p>
            </div>
          )}

          {scholar.synopsisTitle && (
            <div className="mt-4">
              <span className="font-medium text-gray-600">Synopsis Title:</span>
              <p className="text-gray-900 mt-1">{scholar.synopsisTitle}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyScholarCard;
