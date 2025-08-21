import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  useGetScholarsQuery,
  useCreateScholarMutation,
  useUpdateScholarMutation,
  useDeleteScholarMutation,
} from "../../../apiSlices/scholarApi";
import { useGetFacultiesQuery } from "../../../apiSlices/facultyApi";
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

    // Memoize faculties query parameters
    const facultiesQueryParams = useMemo(() => {
      return lockedDepartmentCode
        ? { departmentCode: lockedDepartmentCode }
        : {};
    }, [lockedDepartmentCode]);

    const { data: faculties = [] } = useGetFacultiesQuery(facultiesQueryParams);

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

        {scholarLoading ? (
          <div className="text-gray-500">Loading scholars...</div>
        ) : scholarError ? (
          <div className="text-red-500">
            Error: {scholarError.message || "Failed to load scholars"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            {scholars.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                <HiAcademicCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No scholars found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              scholars.map((scholar) => (
                <ScholarCard
                  key={scholar._id}
                  scholar={scholar}
                  faculties={faculties}
                  onEdit={handleScholarEdit}
                  onDelete={handleScholarDelete}
                  onSupervisorAssignment={onSupervisorAssignment}
                  userRole={userRole}
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
