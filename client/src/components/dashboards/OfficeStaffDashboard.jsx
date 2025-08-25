import React, { useState } from "react";
import { useSelector } from "react-redux";
import FacultySection from "../admin/sections/FacultySection";
import ScholarsSection from "../admin/sections/ScholarsSection";
import NotificationDropdown from "../notifications/NotificationDropdown";
import CreateScholarAccountModal from "../admin/modals/CreateScholarAccountModal";
import CreateScholarAccountFromExistingModal from "../admin/modals/CreateScholarAccountFromExistingModal";
import LogoutButton from "../common/LogoutButton";

const OfficeStaffDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const departmentCode = user?.departmentCode || "";
  const [activeTab, setActiveTab] = useState("faculty");
  const [showCreateScholarModal, setShowCreateScholarModal] = useState(false);
  const [showCreateFromExistingModal, setShowCreateFromExistingModal] = useState(false);

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
      {/* Header Section - Matching Admin Dashboard */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
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
              <div className="mt-4 flex items-center justify-center space-x-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Main Office User Access
                </div>
                <button
                  onClick={() => setShowCreateScholarModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  <span className="mr-2">🎓</span>
                  Create New Scholar
                </button>
                <button
                  onClick={() => setShowCreateFromExistingModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <span className="mr-2">👤</span>
                  Account for Existing Scholar
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>

        {/* Tab Navigation - Matching Admin Dashboard Style */}
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

        {/* Tab Content - Matching Admin Dashboard Layout */}
        <div className="space-y-8">{TABS[activeTab].component}</div>
      </div>

      {/* Create Scholar Account Modal */}
      <CreateScholarAccountModal
        isOpen={showCreateScholarModal}
        onClose={() => setShowCreateScholarModal(false)}
        onSuccess={(result) => {
          console.log("Scholar account created:", result);
          // You can add additional logic here if needed
        }}
      />

      {/* Create Account for Existing Scholar Modal */}
      <CreateScholarAccountFromExistingModal
        isOpen={showCreateFromExistingModal}
        onClose={() => setShowCreateFromExistingModal(false)}
        onSuccess={(result) => {
          console.log("Account created for existing scholar:", result);
          // You can add additional logic here if needed
        }}
      />
    </div>
  );
};

export default OfficeStaffDashboard;
