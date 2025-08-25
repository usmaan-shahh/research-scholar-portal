import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetScholarsQuery } from "../../apiSlices/scholarApi";
import LogoutButton from "../common/LogoutButton";
import {
  HiAcademicCap,
  HiUser,
  HiCalendar,
  HiLocationMarker,
} from "react-icons/hi";

const ScholarDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [scholarData, setScholarData] = useState(null);
  
  console.log("ScholarDashboard rendered - User from Redux:", user);
  console.log("ScholarDashboard rendered - Auth state:", useSelector((state) => state.auth));

  // Get scholar data for the current user
  const {
    data: scholars = [],
    isLoading,
    error,
  } = useGetScholarsQuery({
    // Filter by email to find the current scholar
    email: user?.email,
  });

  // Also try to get all scholars to debug
  const {
    data: allScholars = [],
    isLoading: allScholarsLoading,
    error: allScholarsError,
  } = useGetScholarsQuery({});

  // Debug logging
  console.log("ScholarDashboard - User:", user);
  console.log("ScholarDashboard - Scholars data:", scholars);
  console.log("ScholarDashboard - All scholars:", allScholars);
  console.log("ScholarDashboard - Loading:", isLoading);
  console.log("ScholarDashboard - Error:", error);

  useEffect(() => {
    console.log("useEffect triggered - scholars:", scholars, "user:", user);
    if (scholars.length > 0) {
      // Find the scholar profile for the current user
      const currentScholar = scholars.find(
        (scholar) =>
          scholar.email === user?.email || scholar.rollNo === user?.username
      );
      console.log("Found currentScholar:", currentScholar);
      setScholarData(currentScholar);
    } else if (allScholars.length > 0) {
      // Fallback: try to find from all scholars
      console.log("Trying fallback with all scholars");
      const currentScholar = allScholars.find(
        (scholar) =>
          scholar.email === user?.email || scholar.rollNo === user?.username
      );
      console.log("Found currentScholar from fallback:", currentScholar);
      setScholarData(currentScholar);
    } else {
      console.log("No scholars found in data");
    }
  }, [scholars, allScholars, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading scholar data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.data?.message || "Failed to load your scholar profile"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!scholarData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Scholar profile not found
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  Your scholar profile could not be found. Please contact the
                  office staff.
                </div>
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <strong>Debug Info:</strong><br/>
                  User: {JSON.stringify(user, null, 2)}<br/>
                  Scholars found: {scholars.length}<br/>
                  All scholars: {allScholars.length}<br/>
                  User email: {user?.email}<br/>
                  User username: {user?.username}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <HiAcademicCap className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Scholar Dashboard
                </h1>
                <p className="text-gray-600">Welcome back, {scholarData.name}</p>
              </div>
            </div>
            <LogoutButton variant="outline" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HiUser className="h-5 w-5 text-gray-500 mr-2" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Full Name
                  </label>
                  <p className="text-gray-900">{scholarData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Roll Number
                  </label>
                  <p className="text-gray-900">{scholarData.rollNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Registration ID
                  </label>
                  <p className="text-gray-900">{scholarData.regId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{scholarData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p className="text-gray-900">{scholarData.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Department
                  </label>
                  <p className="text-gray-900">{scholarData.departmentCode}</p>
                </div>
              </div>
            </div>

            {/* Academic Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HiAcademicCap className="h-5 w-5 text-gray-500 mr-2" />
                Academic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Postgraduate Degree
                  </label>
                  <p className="text-gray-900">{scholarData.pgDegree}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    PG CGPA
                  </label>
                  <p className="text-gray-900">{scholarData.pgCgpa}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Undergraduate Degree
                  </label>
                  <p className="text-gray-900">{scholarData.bgDegree}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    UG CGPA
                  </label>
                  <p className="text-gray-900">{scholarData.bgCgpa}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Area of Research
                  </label>
                  <p className="text-gray-900">{scholarData.areaOfResearch}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Synopsis Title
                  </label>
                  <p className="text-gray-900">{scholarData.synopsisTitle}</p>
                </div>
              </div>
            </div>

            {/* Important Dates Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HiCalendar className="h-5 w-5 text-gray-500 mr-2" />
                Important Dates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date of Admission
                  </label>
                  <p className="text-gray-900">
                    {new Date(scholarData.dateOfAdmission).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date of Joining
                  </label>
                  <p className="text-gray-900">
                    {new Date(scholarData.dateOfJoining).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Supervisor Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HiUser className="h-5 w-5 text-gray-500 mr-2" />
                Supervisor Information
              </h2>

              {scholarData.supervisor ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">
                      Primary Supervisor
                    </h3>
                    <div className="space-y-2">
                      <p className="text-blue-800 font-medium">
                        {scholarData.supervisor.name}
                      </p>
                      <p className="text-blue-700 text-sm">
                        {scholarData.supervisor.designation}
                      </p>
                    </div>
                  </div>

                  {scholarData.coSupervisor && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-medium text-green-900 mb-2">
                        Co-Supervisor
                      </h3>
                      <div className="space-y-2">
                        <p className="text-green-800 font-medium">
                          {scholarData.coSupervisor.name}
                        </p>
                        <p className="text-green-700 text-sm">
                          {scholarData.coSupervisor.designation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        No supervisor assigned yet
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        Your supervisor will be assigned by the office staff.
                        Please check back later.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      scholarData.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {scholarData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Department</span>
                  <span className="text-gray-900 font-medium">
                    {scholarData.departmentCode}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Supervisors</span>
                  <span className="text-gray-900 font-medium">
                    {scholarData.supervisor
                      ? scholarData.coSupervisor
                        ? "2"
                        : "1"
                      : "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HiLocationMarker className="h-5 w-5 text-gray-500 mr-2" />
                Contact Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="text-gray-900 text-sm">{scholarData.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p className="text-gray-900">{scholarData.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{scholarData.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarDashboard;
