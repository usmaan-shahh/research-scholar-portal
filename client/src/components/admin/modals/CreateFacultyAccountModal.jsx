import React, { useState } from "react";
import { HiUser, HiKey, HiCheck } from "react-icons/hi";

const CreateFacultyAccountModal = ({ isOpen, faculty, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: "",
    tempPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username) {
      return;
    }
    onSubmit({
      facultyId: faculty._id,
      ...formData,
    });
  };

  const handleClose = () => {
    setFormData({ username: "", tempPassword: "" });
    onClose();
  };

  if (!isOpen || !faculty) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto p-0 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl animate-modalIn border border-white/30">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-orange-500 to-red-400 rounded-full shadow-lg border-4 border-white/60">
          <HiUser className="w-10 h-10 text-white" />
        </div>

        <div className="flex flex-col items-center pt-14 pb-2 px-8">
          <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight mb-1 drop-shadow">
            Create User Account
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Create login credentials for {faculty.name}
          </p>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-orange-600 text-3xl font-bold focus:outline-none transition-transform hover:scale-125"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-8 pb-8 pt-2">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Faculty Details:</div>
            <div className="text-sm font-medium text-gray-800">
              {faculty.name} ({faculty.employeeCode})
            </div>
            <div className="text-xs text-gray-500">
              {faculty.designation} • {faculty.departmentCode}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <HiUser className="w-4 h-4 inline mr-1 text-orange-600" />
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username || faculty.employeeCode || ""}
              onChange={handleChange}
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-orange-400 focus:ring-2 focus:ring-orange-200 sm:text-base px-4 py-2 transition"
              placeholder="Leave blank to use employee code"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to use employee code ({faculty.employeeCode}) as
              username
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <HiKey className="w-4 h-4 inline mr-1 text-orange-600" />
              Temporary Password
            </label>
            <input
              type="text"
              name="tempPassword"
              required
              value={formData.tempPassword}
              onChange={handleChange}
              className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-orange-400 focus:ring-2 focus:ring-orange-200 sm:text-base px-4 py-2 transition"
              placeholder="Enter temporary password"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be the initial password. User must change it on first
              login.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 text-base font-semibold text-gray-700 bg-white/70 rounded-xl border border-gray-200 hover:bg-gray-100 transition shadow"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-red-400 rounded-xl border border-transparent hover:from-orange-600 hover:to-red-500 transition shadow-lg flex items-center gap-2"
            >
              <HiCheck className="w-5 h-5" />
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFacultyAccountModal;
