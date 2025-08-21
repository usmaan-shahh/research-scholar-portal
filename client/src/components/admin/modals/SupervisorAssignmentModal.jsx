import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTimes, FaUserGraduate, FaUserTie } from "react-icons/fa";
import { useUpdateScholarMutation } from "../../../apiSlices/scholarApi";
import { useGetFacultiesQuery } from "../../../apiSlices/facultyApi";

const SupervisorAssignmentModal = ({
  scholar,
  departmentCode,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    supervisor: "",
    coSupervisor: "",
  });
  const [loading, setLoading] = useState(false);

  // Get faculties in the department
  const { data: faculties = [] } = useGetFacultiesQuery({
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

  const availableCoSupervisors = faculties.filter(
    (faculty) =>
      faculty._id !== formData.supervisor && faculty._id !== scholar?.supervisor
  );

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor <span className="text-red-500">*</span>
            </label>
            <select
              name="supervisor"
              value={formData.supervisor}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select a supervisor</option>
              {availableSupervisors.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name} - {faculty.designation}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select the primary supervisor for this scholar
            </p>
          </div>

          {/* Co-Supervisor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Co-Supervisor <span className="text-gray-500">(Optional)</span>
            </label>
            <select
              name="coSupervisor"
              value={formData.coSupervisor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">No co-supervisor</option>
              {availableCoSupervisors.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name} - {faculty.designation}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Optional secondary supervisor for additional guidance
            </p>
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
