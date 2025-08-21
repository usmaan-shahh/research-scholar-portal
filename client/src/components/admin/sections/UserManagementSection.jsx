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
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>

      {/* Create Main Office User */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Main Office Users
        </h3>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={selectedDeptCode}
              onChange={(e) => setSelectedDeptCode(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">Select department</option>
              {(deptLoading ? [] : deptsWithoutMainOffice).map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              value={usernamePreview}
              readOnly
              className="w-full rounded-lg border bg-gray-50 border-gray-200 px-3 py-2"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temp Password (optional)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Auto-generate or enter"
              />
              <button
                type="button"
                onClick={handleGenerate}
                className="shrink-0 whitespace-nowrap px-3 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                Generate
              </button>
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>

      {/* Create DRC Chair User */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          DRC Chair Users
        </h3>
        <form
          onSubmit={handleCreateDRC}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={selectedDRCDeptCode}
              onChange={(e) => setSelectedDRCDeptCode(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">Select department</option>
              {(deptLoading ? [] : deptsWithoutDRCChair).map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              value={drcUsernamePreview}
              readOnly
              className="w-full rounded-lg border bg-gray-50 border-gray-200 px-3 py-2"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temp Password (optional)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={drcTempPassword}
                onChange={(e) => setDrcTempPassword(e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Auto-generate or enter"
              />
              <button
                type="button"
                onClick={() => setDrcTempPassword(generatePassword(12))}
                className="shrink-0 whitespace-nowrap px-3 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                Generate
              </button>
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              disabled={creatingDRC}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 disabled:opacity-60"
            >
              {creatingDRC ? "Creating..." : "Create DRC Chair"}
            </button>
          </div>
        </form>
      </div>

      {/* Main Office Users List */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Main Office Users
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Username
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Department
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Must Change Password
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4">
                    Loading...
                  </td>
                </tr>
              ) : mainOfficeUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-gray-500">
                    No Main Office Users
                  </td>
                </tr>
              ) : (
                mainOfficeUsers.map((u) => (
                  <tr key={u._id}>
                    <td className="px-6 py-3">{u.username}</td>
                    <td className="px-6 py-3">
                      {u.department} ({u.departmentCode})
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.mustChangePassword
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.mustChangePassword ? "Required" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex gap-2">
                      <button
                        onClick={() => handleResetPassword(u.departmentCode)}
                        disabled={resetting}
                        className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                      >
                        {resetting ? "Resetting..." : "Reset Password"}
                      </button>
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={updating}
                        className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRC Chair Users List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          DRC Chair Users
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Username
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Department
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Must Change Password
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4">
                    Loading...
                  </td>
                </tr>
              ) : drcChairUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-gray-500">
                    No DRC Chair Users
                  </td>
                </tr>
              ) : (
                drcChairUsers.map((u) => (
                  <tr key={u._id}>
                    <td className="px-6 py-3">{u.username}</td>
                    <td className="px-6 py-3">
                      {u.department} ({u.departmentCode})
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.mustChangePassword
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.mustChangePassword ? "Required" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex gap-2">
                      <button
                        onClick={() => handleResetDRCPassword(u.departmentCode)}
                        disabled={resettingDRC}
                        className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                      >
                        {resettingDRC ? "Resetting..." : "Reset Password"}
                      </button>
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={updating}
                        className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
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
