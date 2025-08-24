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
      isActive: "",
      supervisor: "",
      supervisorAssignment: "",
    });

    const queryParams = useMemo(() => {
      if (lockedDepartmentCode) {
        return {
          departmentCode: lockedDepartmentCode,
          isActive: scholarFilters.isActive || undefined,
          supervisor: scholarFilters.supervisor || undefined,
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

    const filteredScholars = useMemo(() => {
      let filtered = scholars;

      if (scholarFilters.supervisorAssignment === "assigned") {
        filtered = filtered.filter((s) => s.supervisor);
      } else if (scholarFilters.supervisorAssignment === "unassigned") {
        filtered = filtered.filter((s) => !s.supervisor);
      }

      return filtered;
    }, [scholars, scholarFilters.supervisorAssignment]);

    const {
      data: faculties = [],
      isLoading: facultyLoading,
      error: facultyError,
      refetch: refetchFaculties,
    } = useGetFacultyWithSupervisionLoadQuery(
      lockedDepartmentCode ? { departmentCode: lockedDepartmentCode } : {}
    );

    const [createScholar] = useCreateScholarMutation();
    const [updateScholar] = useUpdateScholarMutation();
    const [deleteScholar] = useDeleteScholarMutation();

    const handleScholarChange = (e) => {
      const { name, value } = e.target;
      setScholarForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleScholarSubmit = async (e) => {
      e.preventDefault();
      const effectiveDepartmentCode =
        lockedDepartmentCode || scholarForm.departmentCode;
      if (!effectiveDepartmentCode) {
        toast.error("Select a department");
        return;
      }

      try {
        if (editingScholar) {
          await updateScholar({
            id: editingScholar._id,
            ...scholarForm,
            departmentCode: effectiveDepartmentCode,
          }).unwrap();
          toast.success("Scholar updated successfully");
        } else {
          await createScholar({
            ...scholarForm,
            departmentCode: effectiveDepartmentCode,
          }).unwrap();
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
          supervisor: "",
          coSupervisor: "",
          departmentCode: lockedDepartmentCode || "",
        });

        if (onRefreshFaculties) {
          onRefreshFaculties();
        } else if (refreshFacultiesRef?.current) {
          refreshFacultiesRef.current();
        }
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
        dateOfAdmission: scholar.dateOfAdmission || "",
        dateOfJoining: scholar.dateOfJoining || "",
        areaOfResearch: scholar.areaOfResearch || "",
        synopsisTitle: scholar.synopsisTitle || "",
        supervisor: scholar.supervisor || "",
        coSupervisor: scholar.coSupervisor || "",
        departmentCode: scholar.departmentCode || lockedDepartmentCode || "",
      });
      setShowScholarModal(true);
    };

    const handleScholarDelete = async (id) => {
      if (window.confirm("Delete this scholar?")) {
        try {
          await deleteScholar(id).unwrap();
          toast.success("Scholar deleted successfully");
          if (onRefreshFaculties) {
            onRefreshFaculties();
          } else if (refreshFacultiesRef?.current) {
            refreshFacultiesRef.current();
          }
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
        supervisor: "",
        coSupervisor: "",
        departmentCode: lockedDepartmentCode || "",
      });
      setShowScholarModal(true);
    };

    const handleScholarModalClose = () => setShowScholarModal(false);

    const handleFilterChange = (key, value) => {
      setScholarFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
      setScholarFilters({
        departmentCode: lockedDepartmentCode || "",
        isActive: "",
        supervisor: "",
        supervisorAssignment: "",
      });
    };

    const eligibleSupervisors = faculties.filter((faculty) => faculty.isPhD);

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            <HiAcademicCap className="inline-block w-8 h-8 mr-3 text-blue-600" />
            {title}
          </h2>
          <button
            onClick={handleScholarAdd}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <HiAcademicCap className="w-5 h-5 mr-2" />
            Add Scholar
          </button>
        </div>

        {!hideFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={scholarFilters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Scholars</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>

              <select
                value={scholarFilters.supervisor}
                onChange={(e) =>
                  handleFilterChange("supervisor", e.target.value)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Supervisors</option>
                {eligibleSupervisors.map((faculty) => (
                  <option key={faculty._id} value={faculty._id}>
                    {faculty.name} ({faculty.employeeCode})
                  </option>
                ))}
              </select>

              <select
                value={scholarFilters.supervisorAssignment}
                onChange={(e) =>
                  handleFilterChange("supervisorAssignment", e.target.value)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Assignment Status</option>
                <option value="assigned">Assigned Supervisors</option>
                <option value="unassigned">Unassigned Scholars</option>
              </select>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {scholarLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : scholarError ? (
          <div className="text-center py-12 text-red-500">
            <p className="text-lg font-semibold">Error loading scholars</p>
            <p className="text-sm">
              {scholarError.data?.message ||
                scholarError.message ||
                "Failed to load scholars"}
            </p>
          </div>
        ) : filteredScholars.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HiAcademicCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No scholars found</p>
            <p className="text-sm">
              {Object.values(scholarFilters).some((v) => v)
                ? "Try adjusting your filters"
                : "No scholars have been added yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredScholars.map((scholar) => (
              <ScholarCard
                key={scholar._id}
                scholar={scholar}
                onEdit={() => handleScholarEdit(scholar)}
                onDelete={() => handleScholarDelete(scholar._id)}
                onSupervisorAssignment={
                  onSupervisorAssignment
                    ? () => onSupervisorAssignment(scholar)
                    : undefined
                }
                showSupervisorAssignments={showSupervisorAssignments}
                canEdit={userRole === "admin" || userRole === "main_office"}
              />
            ))}
          </div>
        )}

        {showScholarModal && (
          <ScholarModal
            isOpen={showScholarModal}
            onClose={handleScholarModalClose}
            onSubmit={handleScholarSubmit}
            formData={scholarForm}
            onChange={handleScholarChange}
            editing={!!editingScholar}
            faculties={eligibleSupervisors}
            lockedDepartmentCode={lockedDepartmentCode}
            userRole={userRole}
          />
        )}
      </div>
    );
  }
);

ScholarsSection.displayName = "ScholarsSection";

export default ScholarsSection;
