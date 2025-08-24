import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaTimes,
  FaUserGraduate,
  FaUserTie,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { useUpdateScholarMutation } from "../../../apiSlices/scholarApi";
import { useGetFacultyWithSupervisionLoadQuery } from "../../../apiSlices/facultyApi";

const SupervisorAssignmentModal = ({
  scholar,
  departmentCode,
  onClose,
  onSuccess,
  refreshFaculties = null,
}) => {
  const [formData, setFormData] = useState({
    supervisor: "",
    coSupervisor: "",
  });
  const [loading, setLoading] = useState(false);

  // Get faculties with supervision load information
  const { data: faculties = [] } = useGetFacultyWithSupervisionLoadQuery({
    departmentCode: departmentCode,
  });

  const [updateScholar] = useUpdateScholarMutation();

  useEffect(() => {
    if (scholar) {
      setFormData({
        supervisor: scholar.supervisor || "",
        coSupervisor: scholar.coSupervisor || "",
      });
    }
  }, [scholar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supervisor) {
      toast.error("Please select a supervisor");
      return;
    }

    setLoading(true);
    try {
      await updateScholar({
        id: scholar._id,
        supervisor: formData.supervisor,
        coSupervisor: formData.coSupervisor || null,
      }).unwrap();

      toast.success("Supervisor assignment updated successfully!");

      // Refresh faculty data to show updated supervision loads
      if (refreshFaculties) {
        refreshFaculties();
      }

      onSuccess();
    } catch (error) {
      toast.error(
        error.data?.message || "Failed to update supervisor assignment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Filter faculties to exclude the current supervisor and co-supervisor
  const availableSupervisors = faculties.filter(
    (faculty) =>
      faculty._id !== scholar?.supervisor &&
      faculty._id !== scholar?.coSupervisor
  );

  // Debug: Log faculty filtering results
  useEffect(() => {
    if (faculties.length > 0) {
      const total = faculties.length;
      const available = availableSupervisors.filter(
        canAcceptMoreScholars
      ).length;
      const blocked = availableSupervisors.filter(
        (f) => !canAcceptMoreScholars(f)
      ).length;

      console.log("Faculty filtering results:", {
        total,
        available,
        blocked,
        blockedDetails: availableSupervisors
          .filter((f) => !canAcceptMoreScholars(f))
          .map((f) => ({
            name: f.name,
            canAccept: f.supervisionLoad?.capacityStatus?.canAcceptMore,
            isEligible: f.supervisionLoad?.isEligible,
            reason: f.supervisionLoad?.eligibilityReason,
          })),
      });
    }
  }, [faculties, availableSupervisors]);

  const availableCoSupervisors = faculties.filter(
    (faculty) =>
      faculty._id !== formData.supervisor && faculty._id !== scholar?.supervisor
  );

  // Function to render supervision load information
  const renderSupervisionLoadInfo = (faculty) => {
    if (!faculty.supervisionLoad) return null;

    const { status, message, severity } =
      faculty.supervisionLoad.capacityStatus;
    const { currentLoad, maxCapacity, remainingCapacity } =
      faculty.supervisionLoad;

    let icon, color, bgColor;
    switch (severity) {
      case "error":
        icon = <FaExclamationTriangle className="w-4 h-4" />;
        color = "text-red-600";
        bgColor = "bg-red-50 border-red-200";
        break;
      case "warning":
        icon = <FaExclamationTriangle className="w-4 h-4" />;
        color = "text-yellow-600";
        bgColor = "bg-yellow-50 border-yellow-200";
        break;
      case "success":
        icon = <FaCheckCircle className="w-4 h-4" />;
        color = "text-green-600";
        bgColor = "bg-green-50 border-green-200";
        break;
      default:
        icon = <FaInfoCircle className="w-4 h-4" />;
        color = "text-gray-600";
        bgColor = "bg-gray-50 border-gray-200";
    }

    return (
      <div className={`mt-1 p-2 rounded border ${bgColor}`}>
        <div className="flex items-center gap-2 text-xs">
          {icon}
          <span className={`font-medium ${color}`}>
            {currentLoad}/{maxCapacity} scholars
          </span>
          <span className="text-gray-500">({remainingCapacity} remaining)</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">{message}</p>
      </div>
    );
  };

  // Function to check if faculty can accept more scholars
  const canAcceptMoreScholars = (faculty) => {
    const canAccept = faculty.supervisionLoad?.capacityStatus?.canAcceptMore;
    const isEligible = faculty.supervisionLoad?.isEligible;

    // Debug logging
    if (!canAccept || !isEligible) {
      console.log(`Faculty ${faculty.name} blocked:`, {
        canAccept,
        isEligible,
        capacityStatus: faculty.supervisionLoad?.capacityStatus,
        eligibilityReason: faculty.supervisionLoad?.eligibilityReason,
      });
    }

    return canAccept && isEligible;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <FaUserGraduate className="text-green-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {scholar?.supervisor
                  ? "Change Supervisor Assignment"
                  : "Assign Supervisor"}
              </h2>
              <p className="text-sm text-gray-600">
                Scholar: {scholar?.name} ({scholar?.rollNo})
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Supervision Assignment Summary */}
        {(formData.supervisor || formData.coSupervisor) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-3">
              Assignment Summary
            </h4>

            {formData.supervisor &&
              (() => {
                const supervisor = faculties.find(
                  (f) => f._id === formData.supervisor
                );
                if (!supervisor) return null;

                const { capacityStatus, isEligible } =
                  supervisor.supervisionLoad || {};
                return (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-700">
                      Supervisor: {supervisor.name}
                    </h5>
                    <div
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs ${
                        capacityStatus?.severity === "error"
                          ? "bg-red-100 text-red-700"
                          : capacityStatus?.severity === "warning"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {capacityStatus?.severity === "error" ? (
                        <FaExclamationTriangle />
                      ) : capacityStatus?.severity === "warning" ? (
                        <FaExclamationTriangle />
                      ) : (
                        <FaCheckCircle />
                      )}
                      {capacityStatus?.message}
                    </div>
                    {!isEligible && (
                      <div className="mt-1 text-xs text-red-600">
                        ⚠️ {supervisor.supervisionLoad?.eligibilityReason}
                      </div>
                    )}
                  </div>
                );
              })()}

            {formData.coSupervisor &&
              (() => {
                const coSupervisor = faculties.find(
                  (f) => f._id === formData.coSupervisor
                );
                if (!coSupervisor) return null;

                const { capacityStatus, isEligible } =
                  coSupervisor.supervisionLoad || {};
                return (
                  <div>
                    <h5 className="font-medium text-gray-700">
                      Co-Supervisor: {coSupervisor.name}
                    </h5>
                    <div
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs ${
                        capacityStatus?.severity === "error"
                          ? "bg-red-100 text-red-700"
                          : capacityStatus?.severity === "warning"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {capacityStatus?.severity === "error" ? (
                        <FaExclamationTriangle />
                      ) : capacityStatus?.severity === "warning" ? (
                        <FaExclamationTriangle />
                      ) : (
                        <FaCheckCircle />
                      )}
                      {capacityStatus?.message}
                    </div>
                    {!isEligible && (
                      <div className="mt-1 text-xs text-red-600">
                        ⚠️ {coSupervisor.supervisionLoad?.eligibilityReason}
                      </div>
                    )}
                  </div>
                );
              })()}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Assignment Info */}
          {scholar?.supervisor && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Current Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Supervisor:</span>
                  <span className="ml-2 text-blue-600">
                    {faculties.find((f) => f._id === scholar.supervisor)
                      ?.name || "Unknown"}
                  </span>
                </div>
                {scholar.coSupervisor && (
                  <div>
                    <span className="font-medium text-blue-700">
                      Co-Supervisor:
                    </span>
                    <span className="ml-2 text-blue-600">
                      {faculties.find((f) => f._id === scholar.coSupervisor)
                        ?.name || "Unknown"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supervisor Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="supervisor"
                value={formData.supervisor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a supervisor</option>
                {availableSupervisors
                  .filter((faculty) => canAcceptMoreScholars(faculty))
                  .map((faculty) => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name} - {faculty.designation} (
                      {faculty.supervisionLoad?.currentLoad || 0}/
                      {faculty.supervisionLoad?.maxCapacity || 0})
                    </option>
                  ))}
              </select>
            </div>

            {/* Show supervision load info for selected supervisor */}
            {formData.supervisor && (
              <div className="mt-2">
                {(() => {
                  const selectedFaculty = faculties.find(
                    (f) => f._id === formData.supervisor
                  );
                  return selectedFaculty
                    ? renderSupervisionLoadInfo(selectedFaculty)
                    : null;
                })()}
              </div>
            )}

            {/* Show warning for faculties that cannot accept more scholars */}
            {availableSupervisors
              .filter((faculty) => !canAcceptMoreScholars(faculty))
              .map((faculty) => {
                const { capacityStatus, isEligible, eligibilityReason } =
                  faculty.supervisionLoad || {};
                let reason = "";

                if (!isEligible) {
                  reason = `Not eligible: ${eligibilityReason}`;
                } else if (!capacityStatus?.canAcceptMore) {
                  reason = capacityStatus?.message || "Capacity limit reached";
                }

                return (
                  <div
                    key={faculty._id}
                    className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700"
                  >
                    <strong>{faculty.name}</strong> cannot accept more scholars:{" "}
                    {reason}
                  </div>
                );
              })}
          </div>

          {/* Co-Supervisor Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Co-Supervisor <span className="text-gray-500">(Optional)</span>
            </label>
            <div className="relative">
              <select
                name="coSupervisor"
                value={formData.coSupervisor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a co-supervisor (optional)</option>
                {availableCoSupervisors
                  .filter((faculty) => canAcceptMoreScholars(faculty))
                  .map((faculty) => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name} - {faculty.designation} (
                      {faculty.supervisionLoad?.currentLoad || 0}/
                      {faculty.supervisionLoad?.maxCapacity || 0})
                    </option>
                  ))}
              </select>
            </div>

            {/* Show supervision load info for selected co-supervisor */}
            {formData.coSupervisor && (
              <div className="mt-2">
                {(() => {
                  const selectedFaculty = faculties.find(
                    (f) => f._id === formData.coSupervisor
                  );
                  return selectedFaculty
                    ? renderSupervisionLoadInfo(selectedFaculty)
                    : null;
                })()}
              </div>
            )}
          </div>

          {/* Scholar Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Scholar Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-600">{scholar?.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Roll No:</span>
                <span className="ml-2 text-gray-600">{scholar?.rollNo}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Research Area:
                </span>
                <span className="ml-2 text-gray-600">
                  {scholar?.areaOfResearch || "Not specified"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Admission Date:
                </span>
                <span className="ml-2 text-gray-600">
                  {scholar?.dateOfAdmission
                    ? new Date(scholar.dateOfAdmission).toLocaleDateString()
                    : "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FaUserTie />
                  {scholar?.supervisor
                    ? "Update Assignment"
                    : "Assign Supervisor"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupervisorAssignmentModal;
