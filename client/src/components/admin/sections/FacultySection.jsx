import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  useGetFacultiesQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
} from "../../../apiSlices/facultyApi";
import { useGetDepartmentsQuery } from "../../../apiSlices/departmentApi";
import FacultyCard from "../cards/FacultyCard";
import FacultyModal from "../modals/FacultyModal";
import { HiUser, HiCheckCircle, HiAcademicCap } from "react-icons/hi";

const FacultySection = ({
  lockedDepartmentCode = "",
  hideFilters = false,
  title = "Faculty Section",
}) => {
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [facultyForm, setFacultyForm] = useState({
    employeeCode: "",
    name: "",
    departmentCode: lockedDepartmentCode || "",
    designation: "",
    isPhD: false,
    numberOfPublications: 0,
    isActive: true,
  });
  const [facultyFilters, setFacultyFilters] = useState({
    departmentCode: lockedDepartmentCode || "",
    designation: "",
    supervisionEligibility: "",
  });

  const {
    data: faculties = [],
    isLoading: facultyLoading,
    error: facultyError,
    refetch: refetchFaculties,
  } = useGetFacultiesQuery(
    lockedDepartmentCode
      ? {
          departmentCode: lockedDepartmentCode,
          designation: facultyFilters.designation,
          supervisionEligibility: facultyFilters.supervisionEligibility,
        }
      : facultyFilters
  );

  const { data: departments = [] } = useGetDepartmentsQuery();

  const [createFaculty] = useCreateFacultyMutation();
  const [updateFaculty] = useUpdateFacultyMutation();
  const [deleteFaculty] = useDeleteFacultyMutation();

  const DESIGNATIONS = [
    { label: "Professor", value: "Professor", max: 8 },
    { label: "Associate Professor", value: "Associate Professor", max: 6 },
    { label: "Assistant Professor", value: "Assistant Professor", max: 4 },
  ];

  // Faculty handlers
  const handleFacultyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFacultyForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    const selectedDesignation = DESIGNATIONS.find(
      (d) => d.value === facultyForm.designation
    );
    if (!selectedDesignation) {
      toast.error("Select a valid designation");
      return;
    }
    const effectiveDepartmentCode =
      lockedDepartmentCode || facultyForm.departmentCode;
    if (!effectiveDepartmentCode) {
      toast.error("Select a department");
      return;
    }
    try {
      const payload = {
        ...facultyForm,
        departmentCode: effectiveDepartmentCode,
        maxScholars: selectedDesignation.max,
      };
      if (editingFaculty) {
        await updateFaculty({ id: editingFaculty._id, ...payload }).unwrap();
        toast.success("Faculty updated");
      } else {
        await createFaculty(payload).unwrap();
        toast.success("Faculty created");
      }
      setShowFacultyModal(false);
      setEditingFaculty(null);
      setFacultyForm({
        employeeCode: "",
        name: "",
        departmentCode: lockedDepartmentCode || "",
        designation: "",
        isPhD: false,
        numberOfPublications: 0,
        isActive: true,
      });
      refetchFaculties();
    } catch (err) {
      toast.error(err.data?.message || "Operation failed");
    }
  };

  const handleFacultyEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFacultyForm({
      employeeCode: faculty.employeeCode,
      name: faculty.name,
      departmentCode: lockedDepartmentCode || faculty.departmentCode,
      designation: faculty.designation,
      isPhD: faculty.isPhD,
      numberOfPublications: faculty.numberOfPublications ?? 0,
      isActive: faculty.isActive ?? true,
    });
    setShowFacultyModal(true);
  };

  const handleFacultyDelete = async (id) => {
    if (window.confirm("Delete this faculty member?")) {
      try {
        await deleteFaculty(id).unwrap();
        toast.success("Faculty deleted");
        refetchFaculties();
      } catch (err) {
        toast.error(err.data?.message || "Delete failed");
      }
    }
  };

  const handleFacultyAdd = () => {
    setEditingFaculty(null);
    setFacultyForm({
      employeeCode: "",
      name: "",
      departmentCode: lockedDepartmentCode || "",
      designation: "",
      isPhD: false,
      numberOfPublications: 0,
      isActive: true,
    });
    setShowFacultyModal(true);
  };

  const handleFacultyModalClose = () => setShowFacultyModal(false);

  const handleFacultyFilterChange = (e) => {
    const { name, value } = e.target;
    setFacultyFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <button
          onClick={handleFacultyAdd}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all duration-150"
        >
          Add New Faculty
        </button>
      </div>

      {/* Filters */}
      {!hideFilters && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            name="departmentCode"
            value={lockedDepartmentCode || facultyFilters.departmentCode}
            onChange={handleFacultyFilterChange}
            disabled={!!lockedDepartmentCode}
            className="border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.code} value={dept.code}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            name="designation"
            value={facultyFilters.designation}
            onChange={handleFacultyFilterChange}
            className="border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Designations</option>
            {DESIGNATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <select
            name="supervisionEligibility"
            value={facultyFilters.supervisionEligibility}
            onChange={handleFacultyFilterChange}
            className="border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Eligibility Status</option>
            <option value="eligible">Eligible for Supervision</option>
            <option value="not-eligible">Not Eligible for Supervision</option>
          </select>
        </div>
      )}

      {facultyLoading ? (
        <div className="text-gray-500">Loading faculty...</div>
      ) : facultyError ? (
        <div className="text-red-500">
          Error: {facultyError.message || "Failed to load faculty"}
        </div>
      ) : (
        <>
          {/* Summary Section */}
          {faculties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Total Faculty
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {faculties.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <HiUser className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Eligible for Supervision
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {
                        faculties.filter((f) => f.isEligibleForSupervision)
                          .length
                      }
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <HiCheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600">
                      Not Eligible
                    </p>
                    <p className="text-2xl font-bold text-amber-900">
                      {
                        faculties.filter((f) => !f.isEligibleForSupervision)
                          .length
                      }
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <HiAcademicCap className="w-5 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            {faculties.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                <HiUser className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No faculty found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              faculties.map((faculty) => (
                <FacultyCard
                  key={faculty._id}
                  faculty={faculty}
                  departments={departments}
                  onEdit={handleFacultyEdit}
                  onDelete={handleFacultyDelete}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Faculty Modal */}
      <FacultyModal
        lockedDepartmentCode={lockedDepartmentCode}
        showModal={showFacultyModal}
        editingFaculty={editingFaculty}
        facultyForm={facultyForm}
        departments={departments}
        designations={DESIGNATIONS}
        onClose={handleFacultyModalClose}
        onSubmit={handleFacultySubmit}
        onChange={handleFacultyChange}
      />
    </div>
  );
};

export default FacultySection;
