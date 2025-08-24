import React from "react";
import { HiPlus, HiCheck, HiUser, HiMail, HiKey } from "react-icons/hi";

const FacultyModal = ({
  isOpen,
  editing,
  formData,
  departments,
  designations,
  onClose,
  onSubmit,
  onChange,
  lockedDepartmentCode = "",
}) => {
  if (!isOpen) return null;

  const departmentName = lockedDepartmentCode
    ? departments && departments.length > 0
      ? departments.find((d) => d.code === lockedDepartmentCode)?.name ||
        lockedDepartmentCode
      : lockedDepartmentCode
    : departments && departments.length > 0
    ? departments.find((d) => d.code === formData.departmentCode)?.name ||
      formData.departmentCode
    : formData.departmentCode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto p-0 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl animate-modalIn border border-white/30">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full shadow-lg border-4 border-white/60">
          <HiPlus className="w-10 h-10 text-white" />
        </div>

        <div className="flex flex-col items-center pt-14 pb-2 px-8">
          <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight mb-1 drop-shadow">
            {editing ? "Edit Faculty" : "Add Faculty"}
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
              value={formData.employeeCode}
              onChange={onChange}
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition disabled:bg-gray-100"
              disabled={editing}
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
              value={formData.name}
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
                value={formData.departmentCode}
                onChange={onChange}
                className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
              >
                <option value="">Select Department</option>
                {departments &&
                  departments.length > 0 &&
                  departments.map((dept) => (
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
              value={formData.designation}
              onChange={onChange}
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
            >
              <option value="">Select Designation</option>
              {designations.map((designation) => (
                <option key={designation.value} value={designation.value}>
                  {designation.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isPhD"
              checked={formData.isPhD}
              onChange={onChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label className="text-sm font-semibold text-gray-700">
              PhD Holder
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Number of Publications
            </label>
            <input
              type="number"
              name="numberOfPublications"
              min="0"
              value={formData.numberOfPublications}
              onChange={onChange}
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={onChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label className="text-sm font-semibold text-gray-700">
              Active Status
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
              className="px-5 py-2 text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl border border-transparent hover:from-blue-600 hover:to-cyan-500 transition shadow-lg flex items-center gap-2"
            >
              {editing ? (
                <>
                  <HiCheck className="w-5 h-5" />
                  Update
                </>
              ) : (
                <>
                  <HiPlus className="w-5 h-5" />
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyModal;
