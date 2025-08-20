import React from "react";
import { HiPlus, HiCheck } from "react-icons/hi";

const FacultyModal = ({
  showModal,
  editingFaculty,
  facultyForm,
  departments,
  designations,
  onClose,
  onSubmit,
  onChange,
  lockedDepartmentCode = "",
}) => {
  if (!showModal) return null;

  const departmentName = lockedDepartmentCode
    ? departments.find((d) => d.code === lockedDepartmentCode)?.name ||
      lockedDepartmentCode
    : departments.find((d) => d.code === facultyForm.departmentCode)?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto p-0 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl animate-modalIn border border-white/30">
        {/* Floating Icon */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full shadow-lg border-4 border-white/60">
          <HiPlus className="w-10 h-10 text-white" />
        </div>

        {/* Modal Header */}
        <div className="flex flex-col items-center pt-14 pb-2 px-8">
          <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight mb-1 drop-shadow">
            {editingFaculty ? "Edit Faculty" : "Add Faculty"}
          </h3>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl font-bold focus:outline-none transition-transform hover:scale-125"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-8 pb-8 pt-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Employee Code
            </label>
            <input
              type="text"
              name="employeeCode"
              required
              value={facultyForm.employeeCode}
              onChange={onChange}
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition disabled:bg-gray-100"
              disabled={!!editingFaculty}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={facultyForm.name}
              onChange={onChange}
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Department
            </label>
            {lockedDepartmentCode ? (
              <input
                type="text"
                readOnly
                value={`${departmentName} (${lockedDepartmentCode})`}
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2"
              />
            ) : (
              <select
                name="departmentCode"
                required
                value={facultyForm.departmentCode}
                onChange={onChange}
                className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Designation
            </label>
            <select
              name="designation"
              required
              value={facultyForm.designation}
              onChange={onChange}
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
            >
              <option value="">Select Designation</option>
              {designations.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPhD"
              checked={facultyForm.isPhD}
              onChange={onChange}
              className="mr-2 focus:ring-blue-500"
              id="isPhD"
            />
            <label
              htmlFor="isPhD"
              className="block text-sm font-medium text-gray-700"
            >
              isPhD
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Max Scholars
            </label>
            <input
              type="number"
              name="maxScholars"
              value={
                designations.find((d) => d.value === facultyForm.designation)
                  ?.max || ""
              }
              disabled
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner sm:text-base px-4 py-2"
            />
          </div>

          {/* Number of Publications */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Number of Publications
            </label>
            <input
              type="number"
              name="numberOfPublications"
              min="0"
              value={facultyForm.numberOfPublications || 0}
              onChange={onChange}
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
            />
          </div>

          {/* isActive Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={facultyForm.isActive || false}
              onChange={onChange}
              className="mr-2 focus:ring-blue-500"
              id="isActive"
            />
            <label
              htmlFor="isActive"
              className="block text-sm font-medium text-gray-700"
            >
              Active Faculty
            </label>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-base font-semibold text-gray-700 bg-white/70 rounded-xl border border-gray-200 hover:bg-gray-100 transition shadow"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-base font-bold text-white bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-xl shadow-lg hover:from-blue-600 hover:to-cyan-500 transition flex items-center gap-2 focus:ring-2 focus:ring-blue-300"
            >
              <HiCheck className="w-5 h-5" />
              {editingFaculty ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyModal;
