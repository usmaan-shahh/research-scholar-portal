import React, { useState } from "react";
import { FaUniversity } from "react-icons/fa";
import DepartmentSection from "./sections/DepartmentSection";
import FacultySection from "./sections/FacultySection";

const TABS = {
  DEPARTMENTS: "Department Section",
  FACULTY: "Faculty Section",
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(TABS.DEPARTMENTS);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 text-white rounded-full p-3 shadow">
          <FaUniversity size={28} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-800">
          Admin Dashboard
        </h1>
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
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto">
        {activeTab === TABS.DEPARTMENTS && <DepartmentSection />}
        {activeTab === TABS.FACULTY && <FacultySection />}
      </div>
    </div>
  );
};

export default AdminDashboard;
