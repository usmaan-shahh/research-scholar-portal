import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  useGetFacultiesQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
  useCreateFacultyAccountMutation,
} from "../../../apiSlices/facultyApi";
import { useGetDepartmentsQuery } from "../../../apiSlices/departmentApi";
import FacultyCard from "../cards/FacultyCard";
import FacultyModal from "../modals/FacultyModal";
import CreateFacultyAccountModal from "../modals/CreateFacultyAccountModal";
import { HiUser, HiCheckCircle, HiAcademicCap, HiKey } from "react-icons/hi";

const FacultySection = ({
  lockedDepartmentCode = "",
  hideFilters = false,
  title = "Faculty Section",
}) => {
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [selectedFacultyForAccount, setSelectedFacultyForAccount] =
    useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [facultyForm, setFacultyForm] = useState({
    employeeCode: "",
    name: "",
    departmentCode: lockedDepartmentCode || "",
    designation: "",
    isPhD: false,
    numberOfPublications: 0,
    isActive: true,
    createUserAccount: false,
    username: "",
    tempPassword: "",
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
  const [createFacultyAccount] = useCreateFacultyAccountMutation();

  const DESIGNATIONS = [
    { label: "Professor", value: "Professor", max: 8 },
    { label: "Associate Professor", value: "Associate Professor", max: 6 },
    { label: "Assistant Professor", value: "Assistant Professor", max: 4 },
  ];

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

    if (facultyForm.createUserAccount) {
      if (!facultyForm.username) {
        toast.error("Username is required for account creation");
        return;
      }
      if (!facultyForm.tempPassword) {
        toast.error("Temporary password is required for account creation");
        return;
      }
    }

    try {
      if (editingFaculty) {
        await updateFaculty({
          id: editingFaculty._id,
          ...facultyForm,
          departmentCode: effectiveDepartmentCode,
        }).unwrap();
        toast.success("Faculty updated successfully");
      } else {
        await createFaculty({
          ...facultyForm,
          departmentCode: effectiveDepartmentCode,
        }).unwrap();
        toast.success("Faculty created successfully");
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
        createUserAccount: false,
        username: "",
        tempPassword: "",
      });
      refetchFaculties();
    } catch (err) {
      toast.error(err.data?.message || "Operation failed");
    }
  };

  const handleFacultyEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFacultyForm({
      employeeCode: faculty.employeeCode || "",
      name: faculty.name || "",
      departmentCode: faculty.departmentCode || lockedDepartmentCode || "",
      designation: faculty.designation || "",
      isPhD: faculty.isPhD || false,
      numberOfPublications: faculty.numberOfPublications || 0,
      isActive: faculty.isActive !== undefined ? faculty.isActive : true,
      createUserAccount: false,
      username: "",
      tempPassword: "",
    });
    setShowFacultyModal(true);
  };

  const handleFacultyDelete = async (id) => {
    if (window.confirm("Delete this faculty member?")) {
      try {
        await deleteFaculty(id).unwrap();
        toast.success("Faculty deleted successfully");
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
      createUserAccount: false,
      username: "",
      tempPassword: "",
    });
    setShowFacultyModal(true);
  };

  const handleFacultyModalClose = () => setShowFacultyModal(false);

  const handleCreateAccount = (faculty) => {
    setSelectedFacultyForAccount(faculty);
    setShowCreateAccountModal(true);
  };

  const handleCreateAccountSubmit = async (accountData) => {
    try {
      await createFacultyAccount({
        facultyId: selectedFacultyForAccount._id,
        ...accountData,
      }).unwrap();
      toast.success("Faculty account created successfully");
      setShowCreateAccountModal(false);
      setSelectedFacultyForAccount(null);
      refetchFaculties();
    } catch (err) {
      toast.error(err.data?.message || "Failed to create account");
    }
  };

  const handleCreateAccountClose = () => {
    setShowCreateAccountModal(false);
    setSelectedFacultyForAccount(null);
  };

  const handleFilterChange = (key, value) => {
    setFacultyFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFacultyFilters({
      departmentCode: lockedDepartmentCode || "",
      designation: "",
      supervisionEligibility: "",
    });
  };

  const filteredFaculties = faculties.filter((faculty) => {
    if (
      facultyFilters.designation &&
      faculty.designation !== facultyFilters.designation
    ) {
      return false;
    }
    if (
      facultyFilters.supervisionEligibility === "eligible" &&
      !faculty.isPhD
    ) {
      return false;
    }
    if (
      facultyFilters.supervisionEligibility === "ineligible" &&
      faculty.isPhD
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          <HiAcademicCap className="inline-block w-8 h-8 mr-3 text-blue-600" />
          {title}
        </h2>
        <button
          onClick={handleFacultyAdd}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <HiUser className="w-5 h-5 mr-2" />
          Add Faculty
        </button>
      </div>

      {!hideFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!lockedDepartmentCode && (
              <select
                value={facultyFilters.departmentCode}
                onChange={(e) =>
                  handleFilterChange("departmentCode", e.target.value)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.code}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            )}

            <select
              value={facultyFilters.designation}
              onChange={(e) =>
                handleFilterChange("designation", e.target.value)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Designations</option>
              {DESIGNATIONS.map((designation) => (
                <option key={designation.value} value={designation.value}>
                  {designation.label}
                </option>
              ))}
            </select>

            <select
              value={facultyFilters.supervisionEligibility}
              onChange={(e) =>
                handleFilterChange("supervisionEligibility", e.target.value)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Faculty</option>
              <option value="eligible">PhD Holders Only</option>
              <option value="ineligible">Non-PhD Holders Only</option>
            </select>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {facultyLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : facultyError ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-lg font-semibold">Error loading faculty</p>
          <p className="text-sm">
            {facultyError.data?.message ||
              facultyError.message ||
              "Failed to load faculty"}
          </p>
        </div>
      ) : filteredFaculties.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <HiUser className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No faculty found</p>
          <p className="text-sm">
            {Object.values(facultyFilters).some((v) => v)
              ? "Try adjusting your filters"
              : "No faculty members have been added yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFaculties.map((faculty) => (
            <FacultyCard
              key={faculty._id}
              faculty={faculty}
              onEdit={() => handleFacultyEdit(faculty)}
              onDelete={() => handleFacultyDelete(faculty._id)}
              onCreateAccount={() => handleCreateAccount(faculty)}
              canCreateAccount={!faculty.userAccount}
            />
          ))}
        </div>
      )}

      {showFacultyModal && (
        <FacultyModal
          isOpen={showFacultyModal}
          onClose={handleFacultyModalClose}
          onSubmit={handleFacultySubmit}
          formData={facultyForm}
          onChange={handleFacultyChange}
          editing={!!editingFaculty}
          departments={departments}
          designations={DESIGNATIONS}
          lockedDepartmentCode={lockedDepartmentCode}
        />
      )}

      {showCreateAccountModal && selectedFacultyForAccount && (
        <CreateFacultyAccountModal
          isOpen={showCreateAccountModal}
          onClose={handleCreateAccountClose}
          onSubmit={handleCreateAccountSubmit}
          faculty={selectedFacultyForAccount}
        />
      )}
    </div>
  );
};

export default FacultySection;
