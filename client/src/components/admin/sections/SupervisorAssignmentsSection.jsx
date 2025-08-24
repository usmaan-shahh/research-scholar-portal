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

  // Get all scholars in the department
  const { data: scholarsData = [], isLoading: scholarsLoading } =
    useGetScholarsQuery({
      departmentCode: departmentCode,
      isActive: true,
    });

  // Get all faculties in the department
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

  // Separate scholars by supervisor status
  const scholarsWithSupervisor = scholars.filter(
    (scholar) => scholar.supervisor
  );
  const scholarsWithoutSupervisor = scholars.filter(
    (scholar) => !scholar.supervisor
  );

  // Get faculty names for display
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
      {/* Summary Cards */}
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
                Need Supervisors
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {scholarsWithoutSupervisor.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scholars Without Supervisors */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Scholars Needing Supervisors ({scholarsWithoutSupervisor.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            These scholars need supervisor assignments. Click on a scholar to
            assign a supervisor.
          </p>
        </div>

        {scholarsWithoutSupervisor.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              All scholars have supervisors!
            </h3>
            <p className="text-gray-600">
              Great job! All scholars in your department are properly assigned.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scholar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Research Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scholarsWithoutSupervisor.map((scholar) => (
                  <tr
                    key={scholar._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSupervisorAssignment(scholar)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FaUserGraduate className="text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {scholar.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {scholar.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {scholar.rollNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {scholar.areaOfResearch || "Not specified"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(scholar.dateOfAdmission).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSupervisorAssignment(scholar);
                        }}
                        className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                      >
                        Assign Supervisor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scholars With Supervisors */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Scholars With Supervisors ({scholarsWithSupervisor.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            These scholars already have supervisors assigned.
          </p>
        </div>

        {scholarsWithSupervisor.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">No scholars with supervisors yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scholar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Co-Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scholarsWithSupervisor.map((scholar) => (
                  <tr key={scholar._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUserGraduate className="text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {scholar.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {scholar.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {scholar.rollNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFacultyName(scholar.supervisor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {scholar.coSupervisor
                        ? getFacultyName(scholar.coSupervisor)
                        : "Not assigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onSupervisorAssignment(scholar)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                      >
                        Change Assignment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorAssignmentsSection;
