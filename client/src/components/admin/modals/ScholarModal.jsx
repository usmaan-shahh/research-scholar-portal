import React, { useState, useEffect } from "react";
import { HiPlus, HiCheck } from "react-icons/hi";

const ScholarModal = ({
  isOpen,
  editing,
  formData,
  faculties,
  onClose,
  onSubmit,
  onChange,
  lockedDepartmentCode = "",
  userRole = "",
}) => {
  if (!isOpen) return null;

  const departmentName = lockedDepartmentCode
    ? faculties.find((f) => f.departmentCode === lockedDepartmentCode)
        ?.departmentCode || lockedDepartmentCode
    : "";

  const isMainOfficeStaff = userRole === "main_office";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-auto p-0 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl animate-modalIn border border-white/30 max-h-[90vh] overflow-y-auto">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full shadow-lg border-4 border-white/60">
          <HiPlus className="w-10 h-10 text-white" />
        </div>

        <div className="flex flex-col items-center pt-14 pb-2 px-8">
          <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight mb-1 drop-shadow">
            {editing ? "Edit Scholar" : "Add Scholar"}
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
                  value={formData.name}
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
                  value={formData.email}
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
                  value={formData.phone}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Academic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  name="rollNo"
                  required
                  value={formData.rollNo}
                  onChange={onChange}
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
                  value={formData.regId}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  PG Degree
                </label>
                <input
                  type="text"
                  name="pgDegree"
                  value={formData.pgDegree}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  PG CGPA
                </label>
                <input
                  type="number"
                  name="pgCgpa"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.pgCgpa}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  BG Degree
                </label>
                <input
                  type="text"
                  name="bgDegree"
                  value={formData.bgDegree}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  BG CGPA
                </label>
                <input
                  type="number"
                  name="bgCgpa"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.bgCgpa}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Research & Dates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Area of Research
                </label>
                <input
                  type="text"
                  name="areaOfResearch"
                  value={formData.areaOfResearch}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Synopsis Title
                </label>
                <input
                  type="text"
                  name="synopsisTitle"
                  value={formData.synopsisTitle}
                  onChange={onChange}
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
                  value={formData.dateOfAdmission}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date of Joining
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={onChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                />
              </div>
            </div>
          </div>

          {!isMainOfficeStaff && (
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Supervisor Assignment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Primary Supervisor
                  </label>
                  <select
                    name="supervisor"
                    value={formData.supervisor}
                    onChange={onChange}
                    className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                  >
                    <option value="">Select Supervisor</option>
                    {faculties
                      .filter((faculty) => faculty.isPhD)
                      .map((faculty) => (
                        <option key={faculty._id} value={faculty._id}>
                          {faculty.name} ({faculty.employeeCode}) -{" "}
                          {faculty.designation}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Co-Supervisor
                  </label>
                  <select
                    name="coSupervisor"
                    value={formData.coSupervisor}
                    onChange={onChange}
                    className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:text-base px-4 py-2 transition"
                  >
                    <option value="">Select Co-Supervisor (Optional)</option>
                    {faculties
                      .filter(
                        (faculty) =>
                          faculty.isPhD && faculty._id !== formData.supervisor
                      )
                      .map((faculty) => (
                        <option key={faculty._id} value={faculty._id}>
                          {faculty.name} ({faculty.employeeCode}) -{" "}
                          {faculty.designation}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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

export default ScholarModal;
