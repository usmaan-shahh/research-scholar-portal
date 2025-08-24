import React, { useState } from "react";
import { useSelector } from "react-redux";
import FacultySection from "../admin/sections/FacultySection";
import ScholarsSection from "../admin/sections/ScholarsSection";

const OfficeStaffDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const departmentCode = user?.departmentCode || "";
  const [activeTab, setActiveTab] = useState("faculty");

  const TABS = {
    faculty: {
      label: "Faculty Section",
      icon: "👥",
      component: (
        <FacultySection
          title="Faculty Section"
          lockedDepartmentCode={departmentCode}
          hideFilters={true}
        />
      ),
    },
    scholars: {
      label: "Scholar Section",
      icon: "🎓",
      component: (
        <ScholarsSection
          title="Scholar Section"
          lockedDepartmentCode={departmentCode}
          hideFilters={true}
          userRole={user?.role}
        />
      ),
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-3 tracking-tight">
              Main Office Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Managing{" "}
              <span className="font-semibold text-blue-600">
                {user?.departmentCode}
              </span>{" "}
              department with comprehensive faculty and scholar oversight
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Main Office User Access
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-2 mb-8">
          <div className="flex space-x-1">
            {Object.entries(TABS).map(([key, tab]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform ${
                  activeTab === key
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/60 hover:scale-102"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">{TABS[activeTab].component}</div>
      </div>
    </div>
  );
};

export default OfficeStaffDashboard;
