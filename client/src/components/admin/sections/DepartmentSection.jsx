import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "../../../apiSlices/departmentApi";
import DepartmentCard from "../cards/DepartmentCard";
import DepartmentModal from "../modals/DepartmentModal";
import { HiOfficeBuilding } from "react-icons/hi";

const DepartmentSection = () => {
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    code: "",
    name: "",
    address: "",
    block: "",
  });
  const [deptSearch, setDeptSearch] = useState("");

  const {
    data: departments = [],
    isLoading: deptLoading,
    error: deptError,
    refetch: refetchDepartments,
  } = useGetDepartmentsQuery();

  const [createDepartment] = useCreateDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  const filteredDepartments = useMemo(() => {
    if (!deptSearch.trim()) return departments;
    return departments.filter((dept) =>
      dept.code.toLowerCase().includes(deptSearch.trim().toLowerCase())
    );
  }, [departments, deptSearch]);

  const handleDeptChange = (e) =>
    setDeptForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await updateDepartment({ id: editingDept._id, ...deptForm }).unwrap();
        toast.success("Department updated");
      } else {
        await createDepartment(deptForm).unwrap();
        toast.success("Department created");
      }
      setShowDeptModal(false);
      setEditingDept(null);
      setDeptForm({ code: "", name: "", address: "", block: "" });
      refetchDepartments();
    } catch (err) {
      toast.error(err.data?.message || "Operation failed");
    }
  };

  const handleDeptEdit = (dept) => {
    setEditingDept(dept);
    setDeptForm({
      code: dept.code,
      name: dept.name,
      address: dept.address,
      block: dept.block,
    });
    setShowDeptModal(true);
  };

  const handleDeptDelete = async (id) => {
    if (window.confirm("Delete this department?")) {
      try {
        await deleteDepartment(id).unwrap();
        toast.success("Department deleted");
        refetchDepartments();
      } catch (err) {
        toast.error(err.data?.message || "Delete failed");
      }
    }
  };

  const handleDeptAdd = () => {
    setEditingDept(null);
    setDeptForm({ code: "", name: "", address: "", block: "" });
    setShowDeptModal(true);
  };

  const handleDeptModalClose = () => setShowDeptModal(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          <HiOfficeBuilding className="inline-block w-8 h-8 mr-3 text-blue-600" />
          Department Management
        </h2>
        <button
          onClick={handleDeptAdd}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <HiOfficeBuilding className="w-5 h-5 mr-2" />
          Add Department
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search departments by code..."
            value={deptSearch}
            onChange={(e) => setDeptSearch(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <HiOfficeBuilding className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {deptLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : deptError ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-lg font-semibold">Error loading departments</p>
          <p className="text-sm">
            {deptError.data?.message || deptError.message || "Failed to load departments"}
          </p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <HiOfficeBuilding className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No departments found</p>
          <p className="text-sm">
            {deptSearch ? "Try adjusting your search" : "No departments have been created yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <DepartmentCard
              key={dept._id}
              department={dept}
              onEdit={() => handleDeptEdit(dept)}
              onDelete={() => handleDeptDelete(dept._id)}
            />
          ))}
        </div>
      )}

      {showDeptModal && (
        <DepartmentModal
          isOpen={showDeptModal}
          onClose={handleDeptModalClose}
          onSubmit={handleDeptSubmit}
          formData={deptForm}
          onChange={handleDeptChange}
          editing={!!editingDept}
        />
      )}
    </div>
  );
};

export default DepartmentSection;
