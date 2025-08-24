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
  onClose,
  onUpdate,
  refreshFacultiesRef,
}) => {
  const [formData, setFormData] = useState({
    supervisor: "",
    coSupervisor: "",
  });
  const [loading, setLoading] = useState(false);

  const { data: faculties = [] } = useGetFacultyWithSupervisionLoadQuery({
    departmentCode: scholar?.departmentCode,
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

      if (refreshFacultiesRef?.current) {
        refreshFacultiesRef.current();
      }

      onUpdate();
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

  const availableSupervisors = faculties.filter(
    (faculty) =>
      faculty._id !== scholar?.supervisor &&
      faculty._id !== scholar?.coSupervisor
  );

  const eligibleSupervisors = faculties.filter((faculty) => faculty.isPhD);

  const getSupervisionLoadColor = (load) => {
    if (load >= 8) return "text-red-600";
    if (load >= 6) return "text-yellow-600";
    return "text-green-600";
  };

  const getSupervisionLoadText = (load) => {
    if (load >= 8) return "Overloaded";
    if (load >= 6) return "Moderate";
    return "Available";
  };

  if (!scholar) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Supervisor Assignment
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <FaUserGraduate className="text-blue-600 text-xl" />
              <div>
                <h3 className="font-semibold text-blue-800">{scholar.name}</h3>
                <p className="text-sm text-blue-600">
                  {scholar.rollNo} • {scholar.regId}
                </p>
                <p className="text-sm text-blue-600">
                  {scholar.areaOfResearch || "Research area not specified"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Supervisor <span className="text-red-500">*</span>
              </label>
              <select
                name="supervisor"
                value={formData.supervisor}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a supervisor</option>
                {eligibleSupervisors.map((faculty) => {
                  const currentLoad =
                    faculties.find((f) => f._id === faculty._id)
                      ?.supervisionLoad || 0;
                  return (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name} ({faculty.employeeCode}) -{" "}
                      {faculty.designation} - Load: {currentLoad} -{" "}
                      {getSupervisionLoadText(currentLoad)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Co-Supervisor (Optional)
              </label>
              <select
                name="coSupervisor"
                value={formData.coSupervisor}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a co-supervisor (optional)</option>
                {eligibleSupervisors
                  .filter((faculty) => faculty._id !== formData.supervisor)
                  .map((faculty) => {
                    const currentLoad =
                      faculties.find((f) => f._id === faculty._id)
                        ?.supervisionLoad || 0;
                    return (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} ({faculty.employeeCode}) -{" "}
                        {faculty.designation} - Load: {currentLoad} -{" "}
                        {getSupervisionLoadText(currentLoad)}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-yellow-600 text-lg mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Assignment Guidelines
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Only PhD holders can be assigned as supervisors</li>
                    <li>
                      • Consider faculty supervision load when making
                      assignments
                    </li>
                    <li>
                      • Co-supervisors are optional but recommended for complex
                      research
                    </li>
                    <li>
                      • Faculty with 8+ scholars are considered overloaded
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Assignment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupervisorAssignmentModal;
