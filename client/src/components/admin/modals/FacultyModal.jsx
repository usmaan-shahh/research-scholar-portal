import React from "react";
import { HiPlus, HiCheck, HiUser, HiMail, HiKey } from "react-icons/hi";

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
                  {d.label} (Max: {d.max} scholars)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPhD"
                checked={facultyForm.isPhD}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-semibold text-gray-700">
                Has PhD
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={facultyForm.isActive}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-semibold text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Number of Publications
            </label>
            <input
              type="number"
              name="numberOfPublications"
              min="0"
              value={facultyForm.numberOfPublications}
              onChange={onChange}
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
            />
          </div>

          {/* Account Creation Section - Only show when creating new faculty */}
          {!editingFaculty && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-3">
                  <HiUser className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-800">
                    Create User Account
                  </h4>
                </div>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="createUserAccount"
                    checked={facultyForm.createUserAccount}
                    onChange={onChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="block text-sm font-semibold text-gray-700">
                    Create login account for this faculty member
                  </label>
                </div>

                {facultyForm.createUserAccount && (
                  <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        <HiUser className="w-4 h-4 inline mr-1 text-blue-600" />
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        required={facultyForm.createUserAccount}
                        value={
                          facultyForm.username || facultyForm.employeeCode || ""
                        }
                        onChange={onChange}
                        className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                        placeholder="Leave blank to use employee code"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank to use employee code as username
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        <HiKey className="w-4 h-4 inline mr-1 text-blue-600" />
                        Temporary Password (Optional)
                      </label>
                      <input
                        type="text"
                        name="tempPassword"
                        value={facultyForm.tempPassword || ""}
                        onChange={onChange}
                        className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                        placeholder="Leave blank for auto-generated password"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        If left blank, a secure temporary password will be
                        generated automatically
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {editingFaculty ? (
                <>
                  <HiCheck className="w-4 h-4 mr-2" />
                  Update
                </>
              ) : (
                <>
                  <HiPlus className="w-4 h-4 mr-2" />
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
