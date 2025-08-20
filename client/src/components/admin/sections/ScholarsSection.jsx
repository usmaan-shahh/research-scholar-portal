import React, { useState } from "react";
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

const ScholarsSection = ({
  lockedDepartmentCode = "",
  hideFilters = false,
  title = "Scholar Section",
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
  const [scholarFilters, setScholarFilters] = useState({
    departmentCode: lockedDepartmentCode || "",
    isActive: "",
    supervisor: "",
  });

  const {
    data: scholars = [],
    isLoading: scholarLoading,
    error: scholarError,
    refetch: refetchScholars,
  } = useGetScholarsQuery(
    lockedDepartmentCode
      ? {
          departmentCode: lockedDepartmentCode,
          isActive: scholarFilters.isActive,
          supervisor: scholarFilters.supervisor,
        }
      : scholarFilters
  );

  const { data: faculties = [] } = useGetFacultiesQuery(
    lockedDepartmentCode ? { departmentCode: lockedDepartmentCode } : {}
  );

  const [createScholar] = useCreateScholarMutation();
  const [updateScholar] = useUpdateScholarMutation();
  const [deleteScholar] = useDeleteScholarMutation();

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
    const effectiveDepartmentCode =
      lockedDepartmentCode || scholarForm.departmentCode;
    if (!effectiveDepartmentCode) {
      toast.error("Select a department");
      return;
    }
    if (!scholarForm.supervisor) {
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

      if (editingScholar) {
        await updateScholar({ id: editingScholar._id, ...payload }).unwrap();
        toast.success("Scholar updated");
      } else {
        await createScholar(payload).unwrap();
        toast.success("Scholar created");
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
      refetchScholars();
    } catch (err) {
      toast.error(err.data?.message || "Operation failed");
    }
  };

  const handleScholarEdit = (scholar) => {
    setEditingScholar(scholar);
    setScholarForm({
      name: scholar.name,
      email: scholar.email,
      phone: scholar.phone,
      address: scholar.address,
      rollNo: scholar.rollNo,
      pgDegree: scholar.pgDegree,
      pgCgpa: scholar.pgCgpa.toString(),
      bgDegree: scholar.bgDegree,
      bgCgpa: scholar.bgCgpa.toString(),
      regId: scholar.regId,
      dateOfAdmission: scholar.dateOfAdmission.split("T")[0],
      dateOfJoining: scholar.dateOfJoining.split("T")[0],
      areaOfResearch: scholar.areaOfResearch,
      synopsisTitle: scholar.synopsisTitle,
      supervisor: scholar.supervisor._id || scholar.supervisor,
      coSupervisor: scholar.coSupervisor?._id || scholar.coSupervisor || "",
      departmentCode: lockedDepartmentCode || scholar.departmentCode,
    });
    setShowScholarModal(true);
  };

  const handleScholarDelete = async (id, permanent = false) => {
    const action = permanent ? "permanently delete" : "deactivate";
    if (window.confirm(`Are you sure you want to ${action} this scholar?`)) {
      try {
        await deleteScholar({ id, permanent }).unwrap();
        toast.success(
          permanent ? "Scholar permanently deleted" : "Scholar deactivated"
        );
        refetchScholars();
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

  const handleScholarFilterChange = (e) => {
    const { name, value } = e.target;
    setScholarFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <button
          onClick={handleScholarAdd}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all duration-150"
        >
          Add New Scholar
        </button>
      </div>

      {/* Filters */}
      {!hideFilters && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            name="isActive"
            value={scholarFilters.isActive}
            onChange={handleScholarFilterChange}
            className="border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select
            name="supervisor"
            value={scholarFilters.supervisor}
            onChange={handleScholarFilterChange}
            className="border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Supervisors</option>
            {faculties.map((faculty) => (
              <option key={faculty._id} value={faculty._id}>
                {faculty.name} ({faculty.designation})
              </option>
            ))}
          </select>
        </div>
      )}

      {scholarLoading ? (
        <div className="text-gray-500">Loading scholars...</div>
      ) : scholarError ? (
        <div className="text-red-500">
          Error: {scholarError.message || "Failed to load scholars"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
          {scholars.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <HiAcademicCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No scholars found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            scholars.map((scholar) => (
              <ScholarCard
                key={scholar._id}
                scholar={scholar}
                faculties={faculties}
                onEdit={handleScholarEdit}
                onDelete={handleScholarDelete}
              />
            ))
          )}
        </div>
      )}

      {/* Scholar Modal */}
      <ScholarModal
        lockedDepartmentCode={lockedDepartmentCode}
        showModal={showScholarModal}
        editingScholar={editingScholar}
        scholarForm={scholarForm}
        faculties={faculties}
        onClose={handleScholarModalClose}
        onSubmit={handleScholarSubmit}
        onChange={handleScholarChange}
      />
    </div>
  );
};

export default ScholarsSection;
