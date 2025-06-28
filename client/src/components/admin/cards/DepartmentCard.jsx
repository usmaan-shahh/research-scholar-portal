import React from "react";
import {
  HiOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineMap,
} from "react-icons/hi";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const DepartmentCard = ({ department, onEdit, onDelete }) => {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 w-full min-w-[320px]">
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500"></div>

      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <HiOfficeBuilding className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 break-words">
                {department.name}
              </h3>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  {department.code}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          {/* Address */}
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
              <HiOutlineLocationMarker className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">Address</p>
              <p className="text-sm text-gray-600 leading-relaxed break-words">
                {department.address || "No address provided"}
              </p>
            </div>
          </div>

          {/* Block */}
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
              <HiOutlineMap className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">Block</p>
              <p className="text-sm text-gray-600 break-words">
                {department.block || "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span>Active Department</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(department)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
            title="Edit Department"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(department._id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
            title="Delete Department"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default DepartmentCard;
