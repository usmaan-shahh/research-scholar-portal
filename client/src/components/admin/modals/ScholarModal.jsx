import React, { useState, useEffect } from "react";
import { HiPlus, HiCheck } from "react-icons/hi";

const ScholarModal = ({
  showModal,
  editingScholar,
  scholarForm,
  faculties,
  onClose,
  onSubmit,
  onChange,
  lockedDepartmentCode = "",
  userRole = "",
}) => {
  if (!showModal) return null;

  const departmentName = lockedDepartmentCode
    ? faculties.find((f) => f.departmentCode === lockedDepartmentCode)
        ?.departmentCode || lockedDepartmentCode
    : "";

  // Hide supervisor fields for main_office staff
  const isMainOfficeStaff = userRole === "main_office";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-auto p-0 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl animate-modalIn border border-white/30 max-h-[90vh] overflow-y-auto">
        {/* Floating Icon */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full shadow-lg border-4 border-white/60">
          <HiPlus className="w-10 h-10 text-white" />
        </div>

        {/* Modal Header */}
        <div className="flex flex-col items-center pt-14 pb-2 px-8">
          <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight mb-1 drop-shadow">
            {editingScholar ? "Edit Scholar" : "Add Scholar"}
          </h3>
          {isMainOfficeStaff && (
            <p className="text-sm text-gray-600 text-center mt-2">
              Note: Supervisor assignment will be handled by administrators
            </p>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl font-bold focus:outline-none transition-transform hover:scale-125"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-8 pb-8 pt-2">
          {/* Personal Details Section */}
          <div className="mb-8">
            <h4 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Personal Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={scholarForm.name}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={scholarForm.email}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={scholarForm.phone}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  name="rollNo"
                  required
                  value={scholarForm.rollNo}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  name="address"
                  required
                  rows="2"
                  value={scholarForm.address}
                  onChange={onChange}
                  placeholder="Enter full address"
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  name="departmentCode"
                  value={lockedDepartmentCode || scholarForm.departmentCode}
                  disabled={!!lockedDepartmentCode}
                  className="block w-full rounded-xl border border-gray-300 bg-gray-100 shadow-inner sm:text-base px-4 py-2"
                />
              </div>
            </div>
          </div>

          {/* Academic Details Section */}
          <div className="mb-8">
            <h4 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Academic Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  PG Degree *
                </label>
                <input
                  type="text"
                  name="pgDegree"
                  required
                  value={scholarForm.pgDegree}
                  onChange={onChange}
                  placeholder="e.g., MSc Computer Science"
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  PG CGPA *
                </label>
                <input
                  type="number"
                  name="pgCgpa"
                  required
                  step="0.01"
                  min="0"
                  max="4"
                  value={scholarForm.pgCgpa}
                  onChange={onChange}
                  placeholder="e.g., 3.75"
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Background Degree *
                </label>
                <input
                  type="text"
                  name="bgDegree"
                  required
                  value={scholarForm.bgDegree}
                  onChange={onChange}
                  placeholder="e.g., BSc Computer Science"
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Background CGPA *
                </label>
                <input
                  type="number"
                  name="bgCgpa"
                  required
                  step="0.01"
                  min="0"
                  max="4"
                  value={scholarForm.bgCgpa}
                  onChange={onChange}
                  placeholder="e.g., 3.50"
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Registration ID *
                </label>
                <input
                  type="text"
                  name="regId"
                  required
                  value={scholarForm.regId}
                  onChange={onChange}
                  placeholder="Enter registration ID"
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date of Admission *
                </label>
                <input
                  type="date"
                  name="dateOfAdmission"
                  required
                  value={scholarForm.dateOfAdmission}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date of Joining *
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  required
                  value={scholarForm.dateOfJoining}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>
            </div>
          </div>

          {/* Research Profile Section */}
          <div className="mb-8">
            <h4 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Research Profile
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Area of Research *
                </label>
                <textarea
                  name="areaOfResearch"
                  required
                  rows="2"
                  value={scholarForm.areaOfResearch}
                  onChange={onChange}
                  placeholder="Describe the research area"
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Synopsis Title *
                </label>
                <textarea
                  name="synopsisTitle"
                  required
                  rows="2"
                  value={scholarForm.synopsisTitle}
                  onChange={onChange}
                  placeholder="Enter the synopsis title"
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              {/* Only show supervisor fields for non-main_office staff */}
              {!isMainOfficeStaff && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Supervisor *
                    </label>
                    <select
                      name="supervisor"
                      required
                      value={scholarForm.supervisor}
                      onChange={onChange}
                      className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                    >
                      <option value="">Select Supervisor</option>
                      {faculties.map((faculty) => (
                        <option key={faculty._id} value={faculty._id}>
                          {faculty.name} ({faculty.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Co-Supervisor (Optional)
                    </label>
                    <select
                      name="coSupervisor"
                      value={scholarForm.coSupervisor}
                      onChange={onChange}
                      className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                    >
                      <option value="">Select Co-Supervisor</option>
                      {faculties.map((faculty) => (
                        <option key={faculty._id} value={faculty._id}>
                          {faculty.name} ({faculty.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
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
              {editingScholar ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScholarModal;
