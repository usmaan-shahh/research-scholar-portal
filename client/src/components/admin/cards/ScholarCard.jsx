import React, { useState } from "react";
import { HiPencil, HiTrash, HiEye, HiAcademicCap } from "react-icons/hi";

const ScholarCard = ({ scholar, faculties, onEdit, onDelete }) => {
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
          <div className="text-right">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                scholar.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {scholar.isActive ? "Active" : "Inactive"}
            </span>
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
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-gray-600">Supervisor:</span>
            <p className="font-medium text-gray-800 mt-1">
              {scholar.supervisor
                ? getSupervisorName(
                    scholar.supervisor._id || scholar.supervisor
                  )
                : "Not assigned"}
            </p>
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
            <button
              onClick={() => onEdit(scholar)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Scholar"
            >
              <HiPencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(scholar._id, false)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Deactivate Scholar"
            >
              <HiTrash className="w-4 h-4" />
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
