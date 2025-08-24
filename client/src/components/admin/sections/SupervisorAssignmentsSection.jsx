import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaUserGraduate,
  FaUserTie,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useGetScholarsQuery } from "../../../apiSlices/scholarApi";
import { useGetFacultiesQuery } from "../../../apiSlices/facultyApi";

const SupervisorAssignmentsSection = ({
  departmentCode,
  onSupervisorAssignment,
}) => {
  const [scholars, setScholars] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: scholarsData = [], isLoading: scholarsLoading } =
    useGetScholarsQuery({
      departmentCode: departmentCode,
      isActive: true,
    });

  const { data: facultiesData = [] } = useGetFacultiesQuery({
    departmentCode: departmentCode,
  });

  useEffect(() => {
    if (scholarsData && facultiesData) {
      setScholars(scholarsData);
      setFaculties(facultiesData);
      setLoading(false);
    }
  }, [scholarsData, facultiesData]);

  const scholarsWithSupervisor = scholars.filter(
    (scholar) => scholar.supervisor
  );
  const scholarsWithoutSupervisor = scholars.filter(
    (scholar) => !scholar.supervisor
  );

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find((f) => f._id === facultyId);
    return faculty ? faculty.name : "Unknown";
  };

  if (loading || scholarsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUserGraduate className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Scholars
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {scholars.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <FaUserTie className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                With Supervisors
              </p>
              <p className="text-2xl font-bold text-green-600">
                {scholarsWithSupervisor.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaExclamationTriangle className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Assignment
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {scholarsWithoutSupervisor.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Scholars with Supervisors
          </h3>
          {scholarsWithSupervisor.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No scholars have been assigned supervisors yet
            </p>
          ) : (
            <div className="space-y-3">
              {scholarsWithSupervisor.map((scholar) => (
                <div
                  key={scholar._id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div>
                    <p className="font-medium text-gray-800">{scholar.name}</p>
                    <p className="text-sm text-gray-600">
                      {scholar.rollNo} • {scholar.regId}
                    </p>
                    <p className="text-sm text-green-600">
                      Supervisor: {getFacultyName(scholar.supervisor)}
                    </p>
                  </div>
                  <button
                    onClick={() => onSupervisorAssignment(scholar)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Reassign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Scholars Pending Assignment
          </h3>
          {scholarsWithoutSupervisor.length === 0 ? (
            <p className="text-green-500 text-center py-4">
              All scholars have been assigned supervisors!
            </p>
          ) : (
            <div className="space-y-3">
              {scholarsWithoutSupervisor.map((scholar) => (
                <div
                  key={scholar._id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div>
                    <p className="font-medium text-gray-800">{scholar.name}</p>
                    <p className="text-sm text-gray-600">
                      {scholar.rollNo} • {scholar.regId}
                    </p>
                    <p className="text-sm text-yellow-600">
                      No supervisor assigned
                    </p>
                  </div>
                  <button
                    onClick={() => onSupervisorAssignment(scholar)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Faculty Supervision Load
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculties
            .filter((faculty) => faculty.isPhD)
            .map((faculty) => {
              const supervisedScholars = scholars.filter(
                (scholar) => scholar.supervisor === faculty._id
              );
              return (
                <div
                  key={faculty._id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-800">{faculty.name}</p>
                    <span className="text-sm text-gray-500">
                      {faculty.employeeCode}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {faculty.designation}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Supervising: {supervisedScholars.length}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        supervisedScholars.length >= 8
                          ? "bg-red-100 text-red-800"
                          : supervisedScholars.length >= 6
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {supervisedScholars.length >= 8
                        ? "Overloaded"
                        : supervisedScholars.length >= 6
                        ? "Moderate"
                        : "Available"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SupervisorAssignmentsSection;
