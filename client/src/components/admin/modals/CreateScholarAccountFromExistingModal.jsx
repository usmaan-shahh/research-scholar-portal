import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useCreateUserAccountForExistingScholarMutation } from "../../../apiSlices/scholarApi";
import { useGetScholarsQuery } from "../../../apiSlices/scholarApi";

const CreateScholarAccountFromExistingModal = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedScholar, setSelectedScholar] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [createUserAccountForExistingScholar, { isLoading }] =
    useCreateUserAccountForExistingScholarMutation();

  // Get all scholars without user accounts
  const { data: scholars = [], isLoading: scholarsLoading } =
    useGetScholarsQuery();

  // Filter scholars who don't have user accounts yet
  const scholarsWithoutAccounts = scholars.filter(
    (scholar) => !scholar.hasUserAccount
  );

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
      });
      setSelectedScholar("");
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScholarSelect = (scholarId) => {
    setSelectedScholar(scholarId);
    const scholar = scholars.find((s) => s._id === scholarId);
    if (scholar) {
      // Pre-fill username with roll number or email
      setFormData((prev) => ({
        ...prev,
        username: scholar.rollNo || scholar.email.split("@")[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedScholar) {
      toast.error("Please select a scholar");
      return;
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!formData.username || formData.username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    try {
      const scholar = scholars.find((s) => s._id === selectedScholar);

      const accountData = {
        scholarId: selectedScholar,
        username: formData.username,
        password: formData.password,
      };

      const result = await createUserAccountForExistingScholar(
        accountData
      ).unwrap();

      toast.success("Scholar account created successfully!");
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Error creating scholar account:", error);
      toast.error(error.data?.message || "Failed to create scholar account");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Create Account for Existing Scholar
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Scholar Selection */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3 border-b pb-2">
              Select Scholar
            </h4>

            {scholarsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading scholars...</p>
              </div>
            ) : scholarsWithoutAccounts.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      No scholars found without accounts
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      All scholars already have user accounts, or there are no
                      scholars in the system.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {scholarsWithoutAccounts.map((scholar) => (
                  <div
                    key={scholar._id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors duration-200 ${
                      selectedScholar === scholar._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleScholarSelect(scholar._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="scholar"
                            value={scholar._id}
                            checked={selectedScholar === scholar._id}
                            onChange={() => handleScholarSelect(scholar._id)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {scholar.name}
                            </h4>
                            <div className="text-sm text-gray-600 space-x-4">
                              <span>Roll: {scholar.rollNo}</span>
                              <span>Reg: {scholar.regId}</span>
                              <span>Dept: {scholar.departmentCode}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {scholar.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Login Credentials */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3 border-b pb-2">
              Login Credentials
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pre-filled with roll number, can be modified
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 characters
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {/* Selected Scholar Preview */}
          {selectedScholar && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3 border-b pb-2">
                Selected Scholar Details
              </h4>
              {(() => {
                const scholar = scholars.find((s) => s._id === selectedScholar);
                if (!scholar) return null;

                return (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-900">
                          {scholar.name}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Roll No:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {scholar.rollNo}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Registration ID:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {scholar.regId}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Department:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {scholar.departmentCode}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Email:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {scholar.email}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Area of Research:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {scholar.areaOfResearch}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !selectedScholar ||
                scholarsWithoutAccounts.length === 0
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScholarAccountFromExistingModal;
