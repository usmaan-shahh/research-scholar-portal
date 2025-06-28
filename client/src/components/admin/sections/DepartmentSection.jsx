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

  // Memoized filtered departments
  const filteredDepartments = useMemo(() => {
    if (!deptSearch.trim()) return departments;
    return departments.filter((dept) =>
      dept.code.toLowerCase().includes(deptSearch.trim().toLowerCase())
    );
  }, [departments, deptSearch]);

  // Department handlers
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
          Department Management
        </h2>
        <button
          onClick={handleDeptAdd}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all duration-150"
        >
          Add Department
        </button>
      </div>

      {/* Department Search Filter */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="text"
          placeholder="Search by code..."
          value={deptSearch}
          onChange={(e) => setDeptSearch(e.target.value)}
          className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition shadow-sm bg-white/70"
        />
      </div>

      {deptLoading ? (
        <div className="text-gray-500">Loading departments...</div>
      ) : deptError ? (
        <div className="text-red-500">
          Error: {deptError.message || "Failed to load departments"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredDepartments.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <HiOfficeBuilding className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No departments found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredDepartments.map((dept) => (
              <DepartmentCard
                key={dept._id}
                department={dept}
                onEdit={handleDeptEdit}
                onDelete={handleDeptDelete}
              />
            ))
          )}
        </div>
      )}

      {/* Department Modal */}
      <DepartmentModal
        showModal={showDeptModal}
        editingDept={editingDept}
        deptForm={deptForm}
        onClose={handleDeptModalClose}
        onSubmit={handleDeptSubmit}
        onChange={handleDeptChange}
      />
    </div>
  );
};

export default DepartmentSection;
