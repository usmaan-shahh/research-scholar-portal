import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useGetDepartmentsQuery } from "../../../apiSlices/departmentApi";
import {
  useGetUsersQuery,
  useCreateMainOfficeUserMutation,
  useResetMainOfficePasswordMutation,
  useCreateDRCChairUserMutation,
  useResetDRCChairPasswordMutation,
  useUpdateUserMutation,
} from "../../../apiSlices/userApi";

const passwordChars = {
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lower: "abcdefghijkmnopqrstuvwxyz",
  nums: "23456789",
  syms: "!@#$%^&*",
};

const generatePassword = (len = 12) => {
  const all =
    passwordChars.upper +
    passwordChars.lower +
    passwordChars.nums +
    passwordChars.syms;
  let pwd = "";
  for (let i = 0; i < len; i += 1) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd;
};

const UserManagementSection = () => {
  const { data: departments = [], isLoading: deptLoading } =
    useGetDepartmentsQuery();
  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetUsersQuery();

  const [createMainOfficeUser, { isLoading: creating }] =
    useCreateMainOfficeUserMutation();
  const [resetMainOfficePassword, { isLoading: resetting }] =
    useResetMainOfficePasswordMutation();
  const [createDRCChairUser, { isLoading: creatingDRC }] =
    useCreateDRCChairUserMutation();
  const [resetDRCChairPassword, { isLoading: resettingDRC }] =
    useResetDRCChairPasswordMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const [selectedDeptCode, setSelectedDeptCode] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [selectedDRCDeptCode, setSelectedDRCDeptCode] = useState("");
  const [drcTempPassword, setDrcTempPassword] = useState("");

  const mainOfficeUsers = useMemo(
    () => (users || []).filter((u) => u.role === "main_office"),
    [users]
  );

  const drcChairUsers = useMemo(
    () => (users || []).filter((u) => u.role === "drc_chair"),
    [users]
  );

  const deptsWithoutMainOffice = useMemo(() => {
    const used = new Set(
      mainOfficeUsers.map((u) => (u.departmentCode || "").toUpperCase())
    );
    return departments.filter((d) => !used.has((d.code || "").toUpperCase()));
  }, [departments, mainOfficeUsers]);

  const deptsWithoutDRCChair = useMemo(() => {
    const used = new Set(
      drcChairUsers.map((u) => (u.departmentCode || "").toUpperCase())
    );
    return departments.filter((d) => !used.has((d.code || "").toUpperCase()));
  }, [departments, drcChairUsers]);

  const usernamePreview = selectedDeptCode
    ? `office_${selectedDeptCode.toLowerCase()}`
    : "office_{code}";

  const drcUsernamePreview = selectedDRCDeptCode
    ? `${selectedDRCDeptCode.toLowerCase()}_drc_chair`
    : "{code}_drc_chair";

  const handleGenerate = () => {
    const pwd = generatePassword(12);
    setTempPassword(pwd);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedDeptCode) {
      toast.error("Please select a department");
      return;
    }
    try {
      await createMainOfficeUser({
        departmentCode: selectedDeptCode,
        tempPassword,
      }).unwrap();
      toast.success("Main Office user created successfully");
      setSelectedDeptCode("");
      setTempPassword("");
      refetchUsers();
    } catch (error) {
      toast.error(error.data?.message || "Failed to create user");
    }
  };

  const handleCreateDRC = async (e) => {
    e.preventDefault();
    if (!selectedDRCDeptCode) {
      toast.error("Please select a department");
      return;
    }
    try {
      await createDRCChairUser({
        departmentCode: selectedDRCDeptCode,
        tempPassword: drcTempPassword,
      }).unwrap();
      toast.success("DRC Chair user created successfully");
      setSelectedDRCDeptCode("");
      setDrcTempPassword("");
      refetchUsers();
    } catch (error) {
      toast.error(error.data?.message || "Failed to create user");
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const newPassword = generatePassword(12);
      await updateUser({
        id: userId,
        password: newPassword,
        mustChangePassword: true,
      }).unwrap();
      toast.success(
        `Password reset successfully. New password: ${newPassword}`
      );
      refetchUsers();
    } catch (error) {
      toast.error(error.data?.message || "Failed to reset password");
    }
  };

  const handleResetMainOfficePassword = async (userId) => {
    try {
      await resetMainOfficePassword(userId).unwrap();
      toast.success("Main Office password reset successfully");
      refetchUsers();
    } catch (error) {
      toast.error(error.data?.message || "Failed to reset password");
    }
  };

  const handleResetDRCChairPassword = async (userId) => {
    try {
      await resetDRCChairPassword(userId).unwrap();
      toast.success("DRC Chair password reset successfully");
      refetchUsers();
    } catch (error) {
      toast.error(error.data?.message || "Failed to reset password");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await updateUser({
          id: userId,
          isActive: false,
        }).unwrap();
        toast.success("User deactivated successfully");
        refetchUsers();
      } catch (error) {
        toast.error(error.data?.message || "Failed to deactivate user");
      }
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      await updateUser({
        id: userId,
        isActive: true,
      }).unwrap();
      toast.success("User reactivated successfully");
      refetchUsers();
    } catch (error) {
      toast.error(error.data?.message || "Failed to reactivate user");
    }
  };

  if (deptLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Main Office Users
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={selectedDeptCode}
                  onChange={(e) => setSelectedDeptCode(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  {deptsWithoutMainOffice.map((dept) => (
                    <option key={dept._id} value={dept.code}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={usernamePreview}
                  readOnly
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempPassword}
                  readOnly
                  placeholder="Click Generate to create password"
                  className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                />
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Generate
                </button>
              </div>
              <button
                onClick={handleCreate}
                disabled={!selectedDeptCode || !tempPassword || creating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Main Office User"}
              </button>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              DRC Chair Users
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={selectedDRCDeptCode}
                  onChange={(e) => setSelectedDRCDeptCode(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Department</option>
                  {deptsWithoutDRCChair.map((dept) => (
                    <option key={dept._id} value={dept.code}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={drcUsernamePreview}
                  readOnly
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={drcTempPassword}
                  onChange={(e) => setDrcTempPassword(e.target.value)}
                  placeholder="Enter temporary password"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={() => setDrcTempPassword(generatePassword(12))}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Generate
                </button>
              </div>
              <button
                onClick={handleCreateDRC}
                disabled={
                  !selectedDRCDeptCode || !drcTempPassword || creatingDRC
                }
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingDRC ? "Creating..." : "Create DRC Chair User"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Existing Main Office Users
            </h3>
            <div className="space-y-3">
              {mainOfficeUsers.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No main office users found
                </p>
              ) : (
                mainOfficeUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {user.username || user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user.departmentCode} -{" "}
                        {user.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetMainOfficePassword(user._id)}
                        disabled={resetting}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Reset Password
                      </button>
                      {user.isActive ? (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivateUser(user._id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              Existing DRC Chair Users
            </h3>
            <div className="space-y-3">
              {drcChairUsers.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No DRC chair users found
                </p>
              ) : (
                drcChairUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {user.username || user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user.departmentCode} -{" "}
                        {user.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetDRCChairPassword(user._id)}
                        disabled={resettingDRC}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Reset Password
                      </button>
                      {user.isActive ? (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivateUser(user._id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementSection;
