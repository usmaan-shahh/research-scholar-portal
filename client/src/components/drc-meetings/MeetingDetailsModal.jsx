import React, { useState } from "react";
import {
  HiX,
  HiCalendar,
  HiClock,
  HiLocationMarker,
  HiUsers,
  HiDocumentText,
  HiDownload,
  HiPencil,
  HiTrash,
  HiUpload,
} from "react-icons/hi";
import { toast } from "react-toastify";

const MeetingDetailsModal = ({
  meeting,
  onClose,
  onEdit,
  onDelete,
  onUploadMinutes,
  onDownloadMinutes,
  userRole,
  canEdit = false,
}) => {
  const [showUploadInput, setShowUploadInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: {
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        borderColor: "border-blue-200",
        icon: "📅",
      },
      completed: {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-200",
        icon: "✅",
      },
      cancelled: {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-200",
        icon: "❌",
      },
    };

    const config = statusConfig[status] || statusConfig.scheduled;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
      >
        <span>{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMeetingTypeIcon = (type) => {
    const typeConfig = {
      "Monthly Review": "📊",
      "Thesis Defense": "🎓",
      "Research Discussion": "🔬",
      "Policy Review": "📋",
      Other: "📅",
    };
    return typeConfig[type] || typeConfig.Other;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUploadMinutes(meeting._id, selectedFile);
      setSelectedFile(null);
      setShowUploadInput(false);
    }
  };

  const isUpcoming =
    meeting.status === "scheduled" && new Date(meeting.date) > new Date();
  const isToday =
    meeting.status === "scheduled" &&
    new Date(meeting.date).toDateString() === new Date().toDateString();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <span className="text-2xl">
                {getMeetingTypeIcon(meeting.meetingType)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {meeting.title}
              </h2>
              <p className="text-sm text-gray-600">
                Meeting ID: {meeting.meetingId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Type */}
          <div className="flex items-center gap-4">
            {getStatusBadge(meeting.status)}
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {getMeetingTypeIcon(meeting.meetingType)}
              </span>
              <span className="text-gray-700 font-medium">
                {meeting.meetingType}
              </span>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <HiCalendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(meeting.date)}
                </p>
                {isToday && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium mt-1">
                    Today
                  </span>
                )}
                {isUpcoming && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium mt-1">
                    Upcoming
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <HiClock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium text-gray-900">
                  {formatTime(meeting.time)}
                </p>
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-3">
            <HiLocationMarker className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Venue</p>
              <p className="font-medium text-gray-900">{meeting.venue}</p>
            </div>
          </div>

          {/* Department */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Department</p>
            <p className="font-medium text-gray-900">
              {meeting.departmentCode}
            </p>
          </div>

          {/* Agenda */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Agenda</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">
                {meeting.agenda}
              </p>
            </div>
          </div>

          {/* Notes */}
          {meeting.notes && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Additional Notes</p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {meeting.notes}
                </p>
              </div>
            </div>
          )}

          {/* Attendees */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">
                Attendees ({meeting.attendees?.length || 0})
              </p>
              <HiUsers className="w-5 h-5 text-gray-400" />
            </div>
            {meeting.attendees && meeting.attendees.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {meeting.attendees.map((attendee, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-white rounded border"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          {attendee.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {attendee.name}
                        </p>
                        <p className="text-xs text-gray-500">{attendee.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No attendees assigned</p>
            )}
          </div>

          {/* Meeting Minutes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Meeting Minutes</p>
              <HiDocumentText className="w-5 h-5 text-gray-400" />
            </div>

            {meeting.minutesOfMeeting?.fileName ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiDocumentText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        {meeting.minutesOfMeeting.fileName}
                      </p>
                      <p className="text-xs text-green-600">
                        Uploaded on{" "}
                        {new Date(
                          meeting.minutesOfMeeting.uploadedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDownloadMinutes(meeting._id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <HiDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-sm mb-3">
                  No minutes uploaded yet
                </p>

                {canEdit && meeting.status === "scheduled" && (
                  <div>
                    {!showUploadInput ? (
                      <button
                        onClick={() => setShowUploadInput(true)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <HiUpload className="w-4 h-4" />
                        Upload Minutes
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpload}
                            disabled={!selectedFile}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <HiUpload className="w-4 h-4" />
                            Upload
                          </button>
                          <button
                            onClick={() => {
                              setShowUploadInput(false);
                              setSelectedFile(null);
                            }}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Created By */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Created By</p>
            <p className="font-medium text-gray-900">
              {meeting.createdBy?.name || "Unknown"} (
              {meeting.createdBy?.role || "Unknown"})
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {/* Edit Meeting */}
              {canEdit && meeting.status === "scheduled" && (
                <button
                  onClick={() => onEdit(meeting)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <HiPencil className="w-4 h-4" />
                  Edit Meeting
                </button>
              )}

              {/* Cancel Meeting */}
              {canEdit && meeting.status === "scheduled" && (
                <button
                  onClick={() => onDelete(meeting._id, false)}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <HiTrash className="w-4 h-4" />
                  Cancel Meeting
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailsModal;
