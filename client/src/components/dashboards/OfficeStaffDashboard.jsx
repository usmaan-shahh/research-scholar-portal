import React from "react";
import { useSelector } from "react-redux";
import FacultySection from "../admin/sections/FacultySection";

const OfficeStaffDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const departmentCode = user?.departmentCode || "";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Main Office Dashboard</h1>

      {/* Faculty Management scoped to user's department */}
      <FacultySection
        title="Faculty Management"
        lockedDepartmentCode={departmentCode}
        hideFilters={true}
      />

      {/* TODO: Add ScholarsSection similarly when scholar APIs are available */}
    </div>
  );
};

export default OfficeStaffDashboard;
