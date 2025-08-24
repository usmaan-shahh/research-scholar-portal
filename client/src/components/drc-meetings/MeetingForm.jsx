import React, { useState, useEffect } from "react";
import {
  HiCalendar,
  HiClock,
  HiLocationMarker,
  HiUsers,
  HiX,
} from "react-icons/hi";
import { toast } from "react-toastify";

const MeetingForm = ({
  meeting = null,
  onSubmit,
  onCancel,
  faculties = [],
  departments = [],
  userRole,
  userDepartmentCode,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    agenda: "",
    meetingType: "Other",
    notes: "",
    attendees: [],
    departmentCode: userDepartmentCode || "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || "",
        date: meeting.date
          ? new Date(meeting.date).toISOString().split("T")[0]
          : "",
        time: meeting.time || "",
        venue: meeting.venue || "",
        agenda: meeting.agenda || "",
        meetingType: meeting.meetingType || "Other",
        notes: meeting.notes || "",
        attendees: meeting.attendees?.map((a) => a._id || a) || [],
        departmentCode: meeting.departmentCode || userDepartmentCode || "",
      });
    }
  }, [meeting, userDepartmentCode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Meeting date cannot be in the past";
      }
    }

    if (!formData.time.trim()) {
      newErrors.time = "Time is required";
    }

    if (!formData.venue.trim()) {
      newErrors.venue = "Venue is required";
    }

    if (!formData.agenda.trim()) {
      newErrors.agenda = "Agenda is required";
    }

    if (!formData.departmentCode) {
      newErrors.departmentCode = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(
        meeting
          ? "Meeting updated successfully!"
          : "Meeting created successfully!"
      );
    } catch (error) {
      toast.error(error.message || "Failed to save meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAttendeeToggle = (attendeeId) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(attendeeId)
        ? prev.attendees.filter((id) => id !== attendeeId)
        : [...prev.attendees, attendeeId],
    }));
  };

  const getAvailableFaculties = () => {
    if (!formData.departmentCode) return [];
    return faculties.filter(
      (f) => f.departmentCode === formData.departmentCode
    );
  };

  const availableFaculties = getAvailableFaculties();

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <HiCalendar className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {meeting ? "Edit Meeting" : "Create New Meeting"}
            </h2>
            <p className="text-sm text-gray-600">
              {meeting
                ? "Update meeting details"
                : "Schedule a new DRC meeting"}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter meeting title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? "border-red-300" : "border-gray-300"
                }`}
              />
              <HiCalendar className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.time ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., 14:00-16:00"
              />
              <HiClock className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            {errors.time && (
              <p className="mt-1 text-sm text-red-600">{errors.time}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.venue ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Conference Room A"
              />
              <HiLocationMarker className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            {errors.venue && (
              <p className="mt-1 text-sm text-red-600">{errors.venue}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Type
            </label>
            <select
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Monthly Review">Monthly Review</option>
              <option value="Thesis Defense">Thesis Defense</option>
              <option value="Research Discussion">Research Discussion</option>
              <option value="Policy Review">Policy Review</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="departmentCode"
              value={formData.departmentCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.departmentCode ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Select Department</option>
              {departments &&
                departments.length > 0 &&
                departments.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
            </select>
            {errors.departmentCode && (
              <p className="mt-1 text-sm text-red-600">
                {errors.departmentCode}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agenda <span className="text-red-500">*</span>
          </label>
          <textarea
            name="agenda"
            value={formData.agenda}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.agenda ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Enter meeting agenda and objectives..."
          />
          {errors.agenda && (
            <p className="mt-1 text-sm text-red-600">{errors.agenda}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes or special requirements..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Attendees
          </label>
          {formData.departmentCode ? (
            <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
              {availableFaculties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableFaculties.map((faculty) => (
                    <label
                      key={faculty._id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.attendees.includes(
                          faculty.userId || faculty._id
                        )}
                        onChange={() =>
                          handleAttendeeToggle(faculty.userId || faculty._id)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={!faculty.userId}
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {faculty.name}
                        </span>
                        <p className="text-xs text-gray-500">
                          {faculty.designation}
                          {!faculty.userId && (
                            <span className="text-red-500 ml-1">
                              (No user account)
                            </span>
                          )}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No faculty members found in this department
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Please select a department first to see available attendees
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {meeting ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <HiCalendar />
                {meeting ? "Update Meeting" : "Create Meeting"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;
