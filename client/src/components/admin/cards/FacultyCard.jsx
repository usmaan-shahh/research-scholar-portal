import React from "react";
import {
  HiUser,
  HiOutlineLocationMarker,
  HiAcademicCap,
  HiCheckCircle,
  HiBookOpen,
  HiStatusOnline,
  HiStatusOffline,
  HiShieldCheck,
  HiShieldExclamation,
  HiKey,
  HiUserAdd,
} from "react-icons/hi";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const FacultyCard = ({
  faculty,
  departments,
  onEdit,
  onDelete,
  onCreateAccount,
}) => {
  const isEligible = faculty.isEligibleForSupervision;

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 w-full min-w-[320px]">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500"></div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <HiUser className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 break-words">
                {faculty.name}
              </h3>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {faculty.employeeCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
              <HiOutlineLocationMarker className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Department
              </p>
              <p className="text-sm text-gray-600 leading-relaxed break-words">
                {departments.find((d) => d.code === faculty.departmentCode)
                  ?.name || faculty.departmentCode}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
              <HiAcademicCap className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Designation
              </p>
              <p className="text-sm text-gray-600 break-words">
                {faculty.designation}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
              <HiKey className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                User Account
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    faculty.hasUserAccount
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-orange-100 text-orange-800 border border-orange-200"
                  }`}
                >
                  {faculty.hasUserAccount ? "Active" : "No Account"}
                </span>
                {faculty.hasUserAccount && faculty.username && (
                  <span className="text-xs text-gray-500">
                    @{faculty.username}
                  </span>
                )}
              </div>
              {!faculty.hasUserAccount && (
                <p className="text-xs text-gray-500 mt-1">
                  No login account created yet
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
              {isEligible ? (
                <HiShieldCheck className="w-4 h-4 text-green-500" />
              ) : (
                <HiShieldExclamation className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Supervision Eligibility
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    isEligible
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {isEligible ? "Eligible" : "Not Eligible"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {faculty.eligibilityReason}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
              <HiCheckCircle className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Max Scholars
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {faculty.maxScholars} students
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    faculty.isPhD
                      ? "bg-violet-100 text-violet-800 border border-violet-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {faculty.isPhD ? "PhD" : "Non-PhD"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
              <HiBookOpen className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Publications
              </p>
              <p className="text-sm text-gray-600">
                {faculty.numberOfPublications || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-500">
          {faculty.isActive ? (
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
          {!faculty.hasUserAccount && onCreateAccount && (
            <button
              onClick={() => onCreateAccount(faculty)}
              className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200 border border-transparent hover:border-orange-200"
              title="Create User Account"
            >
              <HiUserAdd className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(faculty)}
            className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 border border-transparent hover:border-emerald-200"
            title="Edit Faculty"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(faculty._id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
            title="Delete Faculty"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default FacultyCard;
