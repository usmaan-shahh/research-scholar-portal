import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  useGetScholarsQuery,
  useCreateScholarMutation,
  useUpdateScholarMutation,
  useDeleteScholarMutation,
} from "../../../apiSlices/scholarApi";
import { useGetFacultyWithSupervisionLoadQuery } from "../../../apiSlices/facultyApi";
import ScholarCard from "../cards/ScholarCard";
import ScholarModal from "../modals/ScholarModal";
import { HiAcademicCap } from "react-icons/hi";

const ScholarsSection = React.memo(
  ({
    lockedDepartmentCode = "",
    hideFilters = false,
    title = "Scholar Section",
    userRole = "",
    onSupervisorAssignment = null,
    showSupervisorAssignments = false,
    refreshFaculties = null,
    onRefreshFaculties = null,
    refreshFacultiesRef = null,
  }) => {
    const [showScholarModal, setShowScholarModal] = useState(false);
    const [editingScholar, setEditingScholar] = useState(null);
    const [scholarForm, setScholarForm] = useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      rollNo: "",
      pgDegree: "",
      pgCgpa: "",
      bgDegree: "",
      bgCgpa: "",
      regId: "",
      dateOfAdmission: "",
      dateOfJoining: "",
      areaOfResearch: "",
      synopsisTitle: "",
      supervisor: "",
      coSupervisor: "",
      departmentCode: lockedDepartmentCode || "",
    });

    // Update form state when userRole changes
    useEffect(() => {
      if (userRole === "main_office") {
        setScholarForm((prev) => ({
          ...prev,
          supervisor: null,
          coSupervisor: null,
        }));
      }
    }, [userRole]);

    const [scholarFilters, setScholarFilters] = useState({
      departmentCode: lockedDepartmentCode || "",
      isActive: "", // Empty string means "all scholars" (both active and inactive)
      supervisor: "",
      supervisorAssignment: "", // New filter for assignment status
    });

    // Memoize query parameters to prevent infinite requests
    const queryParams = useMemo(() => {
      if (lockedDepartmentCode) {
        return {
          departmentCode: lockedDepartmentCode,
          isActive: scholarFilters.isActive || undefined, // Convert empty string to undefined
          supervisor: scholarFilters.supervisor || undefined, // Convert empty string to undefined
        };
      }
      return {
        ...scholarFilters,
        isActive: scholarFilters.isActive || undefined,
        supervisor: scholarFilters.supervisor || undefined,
      };
    }, [
      lockedDepartmentCode,
      scholarFilters.isActive,
      scholarFilters.supervisor,
    ]);

    const {
      data: scholars = [],
      isLoading: scholarLoading,
      error: scholarError,
    } = useGetScholarsQuery(queryParams);

    // Apply additional filtering for supervisor assignment status
    const filteredScholars = useMemo(() => {
      let filtered = scholars;

      if (scholarFilters.supervisorAssignment === "assigned") {
        filtered = filtered.filter((s) => s.supervisor);
      } else if (scholarFilters.supervisorAssignment === "unassigned") {
        filtered = filtered.filter((s) => !s.supervisor);
      }

      if (scholarFilters.search) {
        const searchTerm = scholarFilters.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name?.toLowerCase().includes(searchTerm) ||
            s.rollNo?.toLowerCase().includes(searchTerm)
        );
      }

      return filtered;
    }, [scholars, scholarFilters.supervisorAssignment, scholarFilters.search]);

    // Memoize faculties query parameters
    const facultiesQueryParams = useMemo(() => {
      return lockedDepartmentCode
        ? { departmentCode: lockedDepartmentCode }
        : {};
    }, [lockedDepartmentCode]);

    const { data: faculties = [], refetch: refetchFaculties } =
      useGetFacultyWithSupervisionLoadQuery(facultiesQueryParams);

    // Set up the refresh function ref
    useEffect(() => {
      if (refreshFacultiesRef) {
        refreshFacultiesRef.current = () => {
          // Refetch faculty data
          refetchFaculties();
        };
      }
    }, [refreshFacultiesRef, refetchFaculties]);

    const [createScholar] = useCreateScholarMutation();
    const [updateScholar] = useUpdateScholarMutation();
    const [deleteScholar] = useDeleteScholarMutation();

    // Query parameters are now memoized, so no need for manual refetching

    // Scholar handlers
    const handleScholarChange = (e) => {
      const { name, value, type, checked } = e.target;
      setScholarForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    };

    const handleScholarSubmit = async (e) => {
      e.preventDefault();

      // Use the exact same departmentCode logic as the query
      const effectiveDepartmentCode =
        lockedDepartmentCode || scholarForm.departmentCode;

      if (!effectiveDepartmentCode) {
        toast.error("Select a department");
        return;
      }

      // Only require supervisor for non-main_office staff
      if (userRole !== "main_office" && !scholarForm.supervisor) {
        toast.error("Select a supervisor");
        return;
      }

      try {
        const payload = {
          ...scholarForm,
          departmentCode: effectiveDepartmentCode,
          pgCgpa: parseFloat(scholarForm.pgCgpa),
          bgCgpa: parseFloat(scholarForm.bgCgpa),
        };

        // Validate CGPA values
        if (
          payload.pgCgpa < 0 ||
          payload.pgCgpa > 10 ||
          isNaN(payload.pgCgpa)
        ) {
          toast.error("PG CGPA must be between 0 and 10");
          return;
        }
        if (
          payload.bgCgpa < 0 ||
          payload.bgCgpa > 10 ||
          isNaN(payload.bgCgpa)
        ) {
          toast.error("BG CGPA must be between 0 and 10");
          return;
        }

        // For main_office staff, set supervisor and coSupervisor to null
        if (userRole === "main_office") {
          payload.supervisor = null;
          payload.coSupervisor = null;
        }

        if (editingScholar) {
          await updateScholar({ id: editingScholar._id, ...payload }).unwrap();
          toast.success("Scholar updated successfully");
        } else {
          await createScholar(payload).unwrap();
          toast.success("Scholar created successfully");
        }

        setShowScholarModal(false);
        setEditingScholar(null);
        setScholarForm({
          name: "",
          email: "",
          phone: "",
          address: "",
          rollNo: "",
          pgDegree: "",
          pgCgpa: "",
          bgDegree: "",
          bgCgpa: "",
          regId: "",
          dateOfAdmission: "",
          dateOfJoining: "",
          areaOfResearch: "",
          synopsisTitle: "",
          supervisor: userRole === "main_office" ? null : "",
          coSupervisor: userRole === "main_office" ? null : "",
          departmentCode: lockedDepartmentCode || "",
        });

        // Force refetch with current parameters
        // setTimeout(() => {
        //   refetchScholars();
        // }, 100); // Removed as per edit hint
      } catch (err) {
        toast.error(err.data?.message || "Operation failed");
      }
    };

    const handleScholarEdit = (scholar) => {
      setEditingScholar(scholar);
      setScholarForm({
        name: scholar.name || "",
        email: scholar.email || "",
        phone: scholar.phone || "",
        address: scholar.address || "",
        rollNo: scholar.rollNo || "",
        pgDegree: scholar.pgDegree || "",
        pgCgpa: scholar.pgCgpa || "",
        bgDegree: scholar.bgDegree || "",
        bgCgpa: scholar.bgCgpa || "",
        regId: scholar.regId || "",
        dateOfAdmission: scholar.dateOfAdmission
          ? new Date(scholar.dateOfAdmission).toISOString().slice(0, 10)
          : "",
        dateOfJoining: scholar.dateOfJoining
          ? new Date(scholar.dateOfJoining).toISOString().slice(0, 10)
          : "",
        areaOfResearch: scholar.areaOfResearch || "",
        synopsisTitle: scholar.synopsisTitle || "",
        supervisor: scholar.supervisor?._id || scholar.supervisor || "",
        coSupervisor: scholar.coSupervisor?._id || scholar.coSupervisor || "",
        departmentCode: scholar.departmentCode || lockedDepartmentCode || "",
      });
      setShowScholarModal(true);
    };

    const handleScholarDelete = async (id, permanent = false) => {
      if (
        window.confirm(
          `Are you sure you want to ${
            permanent ? "permanently delete" : "deactivate"
          } this scholar?`
        )
      ) {
        try {
          await deleteScholar({ id, permanent }).unwrap();
          toast.success(
            `Scholar ${
              permanent ? "permanently deleted" : "deactivated"
            } successfully`
          );
          // refetchScholars(); // Removed as per edit hint
        } catch (err) {
          toast.error(err.data?.message || "Delete failed");
        }
      }
    };

    const handleScholarAdd = () => {
      setEditingScholar(null);
      setScholarForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        rollNo: "",
        pgDegree: "",
        pgCgpa: "",
        bgDegree: "",
        bgCgpa: "",
        regId: "",
        dateOfAdmission: "",
        dateOfJoining: "",
        areaOfResearch: "",
        synopsisTitle: "",
        supervisor: userRole === "main_office" ? null : "",
        coSupervisor: userRole === "main_office" ? null : "",
        departmentCode: lockedDepartmentCode || "",
      });
      setShowScholarModal(true);
    };

    const handleScholarModalClose = () => setShowScholarModal(false);

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleScholarAdd}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all duration-150"
          >
            Add Scholar
          </button>
        </div>

        {/* Scholar Search Filters */}
        {!hideFilters && (
          <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={scholarFilters.search || ""}
              onChange={(e) =>
                setScholarFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }))
              }
              className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition shadow-sm bg-white/70"
            />
            <select
              value={scholarFilters.isActive}
              onChange={(e) =>
                setScholarFilters((prev) => ({
                  ...prev,
                  isActive: e.target.value,
                }))
              }
              className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition shadow-sm bg-white/70"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Help text for inactive status */}
            {scholarFilters.isActive === "false" && (
              <div className="col-span-full md:col-span-1 text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                <strong>Inactive scholars:</strong> Cannot be edited, assigned
                supervisors, or modified. They are read-only and excluded from
                active operations.
              </div>
            )}

            {/* Supervisor Assignment Status Filter */}
            {showSupervisorAssignments && (
              <select
                value={scholarFilters.supervisorAssignment || ""}
                onChange={(e) =>
                  setScholarFilters((prev) => ({
                    ...prev,
                    supervisorAssignment: e.target.value,
                  }))
                }
                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition shadow-sm bg-white/70"
              >
                <option value="">All Assignment Status</option>
                <option value="assigned">Supervisor Assigned</option>
                <option value="unassigned">Pending Assignment</option>
              </select>
            )}

            {userRole !== "main_office" && (
              <select
                name="supervisor"
                value={scholarFilters.supervisor}
                onChange={(e) =>
                  setScholarFilters((prev) => ({
                    ...prev,
                    supervisor: e.target.value,
                  }))
                }
                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition shadow-sm bg-white/70"
              >
                <option value="">All Supervisors</option>
                {faculties.map((faculty) => (
                  <option key={faculty._id} value={faculty._id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Clear All Filters Button */}
        {!hideFilters && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() =>
                setScholarFilters({
                  departmentCode: lockedDepartmentCode || "",
                  isActive: "",
                  supervisor: "",
                  supervisorAssignment: "",
                  search: "",
                })
              }
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Supervisor Assignments Summary */}
        {showSupervisorAssignments && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-800">
                Supervisor Assignment Overview
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Total: {filteredScholars.length}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Assigned:{" "}
                  {filteredScholars.filter((s) => s.supervisor).length}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Pending:{" "}
                  {filteredScholars.filter((s) => !s.supervisor).length}
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  Inactive: {filteredScholars.filter((s) => !s.isActive).length}
                </span>
              </div>
            </div>

            {/* Pending Assignments */}
            {filteredScholars.filter((s) => !s.supervisor).length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">
                  Scholars Pending Supervisor Assignment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredScholars
                    .filter((s) => !s.supervisor)
                    .slice(0, 6)
                    .map((scholar) => (
                      <div
                        key={scholar._id}
                        className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {scholar.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {scholar.rollNo}
                          </p>
                        </div>
                        {onSupervisorAssignment && (
                          <button
                            onClick={() => onSupervisorAssignment(scholar)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    ))}
                </div>
                {filteredScholars.filter((s) => !s.supervisor).length > 6 && (
                  <p className="text-sm text-gray-600 mt-3 text-center">
                    +{filteredScholars.filter((s) => !s.supervisor).length - 6}{" "}
                    more pending assignments
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scholars Summary */}
        {!hideFilters && (
          <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Scholars Summary
              </h3>
              <span className="text-sm text-gray-500">
                Showing {filteredScholars.length} of {scholars.length} total
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredScholars.filter((s) => s.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredScholars.filter((s) => !s.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Inactive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredScholars.filter((s) => s.supervisor).length}
                </div>
                <div className="text-sm text-gray-600">With Supervisor</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredScholars.filter((s) => !s.supervisor).length}
                </div>
                <div className="text-sm text-gray-600">Pending Assignment</div>
              </div>
            </div>
          </div>
        )}

        {scholarLoading ? (
          <div className="text-gray-500">Loading scholars...</div>
        ) : scholarError ? (
          <div className="text-red-500">
            Error: {scholarError.message || "Failed to load scholars"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            {filteredScholars.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                <HiAcademicCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">
                  {scholars.length === 0
                    ? "No scholars found"
                    : "No scholars match your current filters"}
                </p>
                <p className="text-sm">
                  {scholars.length === 0
                    ? "Try adjusting your search criteria"
                    : "Try adjusting your filters or search terms"}
                </p>
                {scholars.length > 0 && (
                  <button
                    onClick={() =>
                      setScholarFilters({
                        departmentCode: lockedDepartmentCode || "",
                        isActive: "",
                        supervisor: "",
                        supervisorAssignment: "",
                        search: "",
                      })
                    }
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              filteredScholars.map((scholar) => (
                <ScholarCard
                  key={scholar._id}
                  scholar={scholar}
                  faculties={faculties}
                  onEdit={handleScholarEdit}
                  onDelete={handleScholarDelete}
                  onSupervisorAssignment={onSupervisorAssignment}
                  userRole={userRole}
                  showSupervisorAssignments={showSupervisorAssignments}
                />
              ))
            )}
          </div>
        )}

        {/* Scholar Modal */}
        <ScholarModal
          showModal={showScholarModal}
          editingScholar={editingScholar}
          scholarForm={scholarForm}
          faculties={faculties}
          onClose={handleScholarModalClose}
          onSubmit={handleScholarSubmit}
          onChange={handleScholarChange}
          lockedDepartmentCode={lockedDepartmentCode}
          userRole={userRole}
        />
      </div>
    );
  }
);

export default ScholarsSection;
