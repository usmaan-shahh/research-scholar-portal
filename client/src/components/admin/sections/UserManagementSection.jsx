import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaUserPlus,
  FaUniversity,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaUserTie,
  FaBuilding,
  FaClipboard,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
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
      const resp = await createMainOfficeUser({
        departmentCode: selectedDeptCode,
        tempPassword: tempPassword || undefined,
      }).unwrap();
      if (resp.tempPassword) {
        navigator.clipboard
          ?.writeText(`${resp.username} / ${resp.tempPassword}`)
          .catch(() => {});
        toast.success(
          `Created ${resp.username}. Temp password copied to clipboard.`
        );
      } else {
        toast.success(`Created ${resp.username}.`);
      }
      setSelectedDeptCode("");
      setTempPassword("");
      refetchUsers();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create main office user");
    }
  };

  const handleResetPassword = async (departmentCode) => {
    try {
      const resp = await resetMainOfficePassword({ departmentCode }).unwrap();
      if (resp.tempPassword) {
        navigator.clipboard
          ?.writeText(`${resp.username} / ${resp.tempPassword}`)
          .catch(() => {});
        toast.success(
          `Password reset. Temp password copied for ${resp.username}`
        );
      } else {
        toast.success("Password reset.");
      }
      refetchUsers();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reset password");
    }
  };

  const handleCreateDRC = async (e) => {
    e.preventDefault();
    if (!selectedDRCDeptCode) {
      toast.error("Please select a department");
      return;
    }
    try {
      const resp = await createDRCChairUser({
        departmentCode: selectedDRCDeptCode,
        tempPassword: drcTempPassword || undefined,
      }).unwrap();
      if (resp.tempPassword) {
        navigator.clipboard
          ?.writeText(`${resp.username} / ${resp.tempPassword}`)
          .catch(() => {});
        toast.success(
          `Created ${resp.username}. Temp password copied to clipboard.`
        );
      } else {
        toast.success(`Created ${resp.username}.`);
      }
      setSelectedDRCDeptCode("");
      setDrcTempPassword("");
      refetchUsers();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create DRC Chair user");
    }
  };

  const handleResetDRCPassword = async (departmentCode) => {
    try {
      const resp = await resetDRCChairPassword({ departmentCode }).unwrap();
      if (resp.tempPassword) {
        navigator.clipboard
          ?.writeText(`${resp.username} / ${resp.tempPassword}`)
          .catch(() => {});
        toast.success(
          `Password reset. Temp password copied for ${resp.username}`
        );
      } else {
        toast.success("Password reset.");
      }
      refetchUsers();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reset password");
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await updateUser({ id: user._id, isActive: !user.isActive }).unwrap();
      toast.success(
        `${user.username} is now ${!user.isActive ? "Active" : "Inactive"}`
      );
      refetchUsers();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <FaUsers className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-blue-100 text-lg">
              Manage system users and access controls
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <FaBuilding className="text-2xl text-blue-200" />
              <div>
                <p className="text-blue-100 text-sm">Main Office Users</p>
                <p className="text-2xl font-bold">{mainOfficeUsers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <FaUserTie className="text-2xl text-purple-200" />
              <div>
                <p className="text-blue-100 text-sm">DRC Chair Users</p>
                <p className="text-2xl font-bold">{drcChairUsers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-2xl text-green-200" />
              <div>
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Main Office User */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FaBuilding className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Create Main Office User
              </h3>
              <p className="text-blue-600 text-sm">
                Add new main office staff for departments
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUniversity className="inline mr-2 text-blue-600" />
                  Department
                </label>
                <select
                  value={selectedDeptCode}
                  onChange={(e) => setSelectedDeptCode(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                >
                  <option value="">Select department</option>
                  {(deptLoading ? [] : deptsWithoutMainOffice).map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUsers className="inline mr-2 text-green-600" />
                  Username
                </label>
                <div className="relative">
                  <input
                    value={usernamePreview}
                    readOnly
                    className="w-full rounded-lg border bg-gray-50 border-gray-200 px-4 py-3 text-gray-600 font-mono text-sm"
                  />
                  <FaClipboard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaKey className="inline mr-2 text-orange-600" />
                  Temporary Password
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Auto-generate or enter"
                  />
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 font-medium"
                  >
                    <FaSync className="inline mr-2" />
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Centered Create Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={creating || !selectedDeptCode}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Create DRC Chair User */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <FaUserTie className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Create DRC Chair User
              </h3>
              <p className="text-purple-600 text-sm">
                Add new DRC chair users for departments
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleCreateDRC} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUniversity className="inline mr-2 text-purple-600" />
                  Department
                </label>
                <select
                  value={selectedDRCDeptCode}
                  onChange={(e) => setSelectedDRCDeptCode(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                >
                  <option value="">Select department</option>
                  {(deptLoading ? [] : deptsWithoutDRCChair).map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUsers className="inline mr-2 text-green-600" />
                  Username
                </label>
                <div className="relative">
                  <input
                    value={drcUsernamePreview}
                    readOnly
                    className="w-full rounded-lg border bg-gray-50 border-gray-200 px-4 py-3 text-gray-600 font-mono text-sm"
                  />
                  <FaClipboard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaKey className="inline mr-2 text-orange-600" />
                  Temporary Password
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={drcTempPassword}
                    onChange={(e) => setDrcTempPassword(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="Auto-generate or enter"
                  />
                  <button
                    type="button"
                    onClick={() => setDrcTempPassword(generatePassword(12))}
                    className="px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 font-medium"
                  >
                    <FaSync className="inline mr-2" />
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Centered Create DRC Chair Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={creatingDRC || !selectedDRCDeptCode}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {creatingDRC ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    Create DRC Chair
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Office Users List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FaBuilding className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Main Office Users
                </h3>
                <p className="text-blue-600 text-sm">
                  {mainOfficeUsers.length} users found
                </p>
              </div>
            </div>
            <button
              onClick={refetchUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <FaSync className="text-sm" />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <FaUsers className="inline mr-2 text-blue-600" />
                  Username
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <FaUniversity className="inline mr-2 text-green-600" />
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <FaCheckCircle className="inline mr-2 text-blue-600" />
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <FaKey className="inline mr-2 text-orange-600" />
                  Password Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : mainOfficeUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <FaUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">
                        No Main Office Users
                      </p>
                      <p className="text-sm">
                        Create your first main office user above
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                mainOfficeUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FaUsers className="text-blue-600 text-sm" />
                        </div>
                        <span className="font-medium text-gray-900 font-mono">
                          {u.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUniversity className="text-green-600" />
                        <span className="text-gray-900">{u.department}</span>
                        <span className="text-gray-500 text-sm">
                          ({u.departmentCode})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          u.isActive
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <FaCheckCircle className="mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          u.mustChangePassword
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {u.mustChangePassword ? (
                          <>
                            <FaExclamationTriangle className="mr-1" />
                            Change Required
                          </>
                        ) : (
                          <>
                            <FaInfoCircle className="mr-1" />
                            Up to Date
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResetPassword(u.departmentCode)}
                          disabled={resetting}
                          className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                        >
                          <FaKey className="text-xs" />
                          {resetting ? "Resetting..." : "Reset Password"}
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          disabled={updating}
                          className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50 ${
                            u.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {u.isActive ? (
                            <>
                              <FaEyeSlash className="text-xs" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <FaEye className="text-xs" />
                              Activate
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRC Chair Users List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <FaUserTie className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  DRC Chair Users
                </h3>
                <p className="text-purple-600 text-sm">
                  {drcChairUsers.length} users found
                </p>
              </div>
            </div>
            <button
              onClick={refetchUsers}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
            >
              <FaSync className="text-sm" />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <FaUsers className="inline mr-2 text-purple-600" />
                  Username
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <FaUniversity className="inline mr-2 text-green-600" />
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <FaCheckCircle className="inline mr-2 text-blue-600" />
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <FaKey className="inline mr-2 text-orange-600" />
                  Password Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : drcChairUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <FaUserTie className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No DRC Chair Users</p>
                      <p className="text-sm">
                        Create your first DRC chair user above
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                drcChairUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <FaUserTie className="text-purple-600 text-sm" />
                        </div>
                        <span className="font-medium text-gray-900 font-mono">
                          {u.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUniversity className="text-green-600" />
                        <span className="text-gray-900">{u.department}</span>
                        <span className="text-gray-500 text-sm">
                          ({u.departmentCode})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          u.isActive
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <FaCheckCircle className="mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          u.mustChangePassword
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {u.mustChangePassword ? (
                          <>
                            <FaExclamationTriangle className="mr-1" />
                            Change Required
                          </>
                        ) : (
                          <>
                            <FaInfoCircle className="mr-1" />
                            Up to Date
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleResetDRCPassword(u.departmentCode)
                          }
                          disabled={resettingDRC}
                          className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                        >
                          <FaKey className="text-xs" />
                          {resettingDRC ? "Resetting..." : "Reset Password"}
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          disabled={updating}
                          className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50 ${
                            u.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {u.isActive ? (
                            <>
                              <FaEyeSlash className="text-xs" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <FaEye className="text-xs" />
                              Activate
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementSection;
