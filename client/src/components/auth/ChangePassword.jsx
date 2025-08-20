import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useChangePasswordMutation } from "../../apiSlices/userApi";
import { updateUserField } from "../../slices/authSlice";
import { toast } from "react-toastify";
import { HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";

const ChangePassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [navigationPath, setNavigationPath] = useState("");

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    // This useEffect is no longer needed - let PrivateRoute handle redirects
    // to prevent conflicts with manual navigation after password change
  }, []);

  // Handle navigation after state update
  useEffect(() => {
    if (shouldNavigate && navigationPath) {
      console.log("Navigating to:", navigationPath);
      try {
        navigate(navigationPath);
        // Fallback navigation using window.location if navigate fails
        setTimeout(() => {
          if (window.location.pathname !== navigationPath) {
            console.log("Navigate failed, using window.location fallback");
            window.location.href = navigationPath;
          }
        }, 1000);
      } catch (error) {
        console.error("Navigation error:", error);
        // Fallback to window.location
        window.location.href = navigationPath;
      }
    }
  }, [shouldNavigate, navigationPath, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Password policy: at least 8 characters with upper, lower case and a number
    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPolicy.test(formData.newPassword)) {
      toast.error(
        "Password must be at least 8 characters and include upper, lower case and a number"
      );
      return;
    }

    try {
      console.log("Submitting password change...");
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      console.log("Password changed successfully, updating state...");

      // Update the user state to reflect password change
      dispatch(updateUserField({ mustChangePassword: false }));

      console.log("State updated, showing success message...");
      toast.success("Password changed successfully!");

      console.log("Current user state:", user);
      console.log("About to navigate to dashboard...");

      // Set navigation path and trigger navigation
      if (user?.role === "main_office") {
        console.log("Setting navigation to office-staff dashboard...");
        setNavigationPath("/office-staff");
      } else if (user?.role === "admin") {
        console.log("Setting navigation to admin dashboard...");
        setNavigationPath("/admin");
      } else {
        console.log("Setting navigation to root...");
        setNavigationPath("/");
      }

      // Trigger navigation in next render cycle
      setShouldNavigate(true);
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.data?.message || "Failed to change password");
    }
  };

  if (!user || !user.mustChangePassword) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <HiLockClosed className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Change Your Password
          </h1>
          <p className="text-gray-600">
            For security reasons, you must change your temporary password
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter (A-Z)</li>
                  <li>One lowercase letter (a-z)</li>
                  <li>One number (0-9)</li>
                </ul>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Changing Password..." : "Change Password"}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After changing your password, you'll be
              redirected to your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
