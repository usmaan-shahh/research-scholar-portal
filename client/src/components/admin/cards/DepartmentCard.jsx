import React, { useState } from "react";
import {
  HiOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineMap,
  HiUserGroup,
} from "react-icons/hi";
import { FiEdit2, FiTrash2, FiPlus, FiKey } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  useCreateDRCChairUserMutation,
  useResetDRCChairPasswordMutation,
} from "../../../apiSlices/userApi";
import { useGetUsersQuery } from "../../../apiSlices/userApi";

const DepartmentCard = ({ department, onEdit, onDelete }) => {
  const [showDRCModal, setShowDRCModal] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: users = [], refetch: refetchUsers } = useGetUsersQuery();
  const [createDRCChair] = useCreateDRCChairUserMutation();
  const [resetDRCChairPassword] = useResetDRCChairPasswordMutation();

  // Check if DRC Chair exists for this department
  const drcChair = users.find(
    (user) =>
      user.role === "drc_chair" && user.departmentCode === department.code
  );

  const handleCreateDRCChair = async (e) => {
    e.preventDefault();
    if (!tempPassword.trim()) {
      toast.error("Please enter a temporary password");
      return;
    }

    setIsCreating(true);
    try {
      const response = await createDRCChair({
        departmentCode: department.code,
        tempPassword: tempPassword.trim(),
      }).unwrap();

      toast.success(`DRC Chair created: ${response.username}`);
      setShowDRCModal(false);
      setTempPassword("");
      refetchUsers();
    } catch (error) {
      toast.error(error.data?.message || "Failed to create DRC Chair");
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await resetDRCChairPassword({
        departmentCode: department.code,
      }).unwrap();

      if (response.tempPassword) {
        navigator.clipboard
          ?.writeText(`${response.username} / ${response.tempPassword}`)
          .catch(() => {});
        toast.success(
          `Password reset. Temp password copied for ${response.username}`
        );
      } else {
        toast.success("Password reset successfully");
      }
      refetchUsers();
    } catch (error) {
      toast.error(error.data?.message || "Failed to reset password");
    }
  };

  return (
    <>
      <div className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 w-full">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500"></div>

        <div className="p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <HiOfficeBuilding className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 break-words">
                  {department.name}
                </h3>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    {department.code}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
                <HiOutlineLocationMarker className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Address
                </p>
                <p className="text-sm text-gray-600 leading-relaxed break-words">
                  {department.address || "No address provided"}
                </p>
              </div>
            </div>

            {/* Block */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
                <HiOutlineMap className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">Block</p>
                <p className="text-sm text-gray-600 break-words">
                  {department.block || "Not specified"}
                </p>
              </div>
            </div>

            {/* DRC Chair Status */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
                <HiUserGroup className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  DRC Chair
                </p>
                <div className="flex items-center gap-2">
                  {drcChair ? (
                    <>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {drcChair.username}
                      </span>
                      <button
                        onClick={handleResetPassword}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                        title="Reset Password"
                      >
                        <FiKey className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Not assigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Active Department</span>
          </div>
          <div className="flex items-center space-x-2">
            {!drcChair && (
              <button
                onClick={() => setShowDRCModal(true)}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 border border-transparent hover:border-green-200"
                title="Create DRC Chair"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onEdit(department)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
              title="Edit Department"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(department._id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
              title="Delete Department"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      {/* DRC Chair Creation Modal */}
      {showDRCModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-auto p-0 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl animate-modalIn border border-white/30">
            {/* Floating Icon */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full shadow-lg border-4 border-white/60">
              <HiUserGroup className="w-10 h-10 text-white" />
            </div>

            {/* Modal Header */}
            <div className="flex flex-col items-center pt-14 pb-2 px-8">
              <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight mb-1 drop-shadow">
                Create DRC Chair
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {department.name} ({department.code})
              </p>
              <button
                onClick={() => setShowDRCModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-green-600 text-3xl font-bold focus:outline-none transition-transform hover:scale-125"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleCreateDRCChair}
              className="space-y-5 px-8 pb-8 pt-2"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={`${department.code.toLowerCase()}_drc_chair`}
                  readOnly
                  className="block w-full rounded-xl border border-gray-300 bg-gray-50 shadow-inner sm:text-base px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  required
                  placeholder="Enter temporary password"
                  className="block w-full rounded-xl border border-gray-300 bg-white/60 shadow-inner focus:border-green-400 focus:ring-2 focus:ring-green-200 sm:text-base px-4 py-2 transition"
                />
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowDRCModal(false)}
                  className="px-5 py-2 text-base font-semibold text-gray-700 bg-white/70 rounded-xl border border-gray-200 hover:bg-gray-100 transition shadow"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 text-base font-bold text-white bg-gradient-to-tr from-green-500 to-emerald-400 rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-500 transition flex items-center gap-2 focus:ring-2 focus:ring-green-300 disabled:opacity-60"
                >
                  {isCreating ? "Creating..." : "Create DRC Chair"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentCard;
