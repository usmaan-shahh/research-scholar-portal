import React, { useState } from "react";
import {
  HiCalendar,
  HiClock,
  HiLocationMarker,
  HiUsers,
  HiDocumentText,
  HiPencil,
  HiTrash,
  HiEye,
  HiDownload,
} from "react-icons/hi";
import { toast } from "react-toastify";

const MeetingCard = ({
  meeting,
  onEdit,
  onDelete,
  onViewDetails,
  onUploadMinutes,
  onDownloadMinutes,
  userRole,
  canEdit = false,
}) => {
  const [showAttendees, setShowAttendees] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
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
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
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

  const handleUploadMinutes = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      onUploadMinutes(meeting._id, file);
    }
  };

  const isUpcoming =
    meeting.status === "scheduled" && new Date(meeting.date) > new Date();
  const isToday =
    meeting.status === "scheduled" &&
    new Date(meeting.date).toDateString() === new Date().toDateString();

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 overflow-hidden ${
        isToday ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {getMeetingTypeIcon(meeting.meetingType)}
            </span>
            <h3 className="font-bold text-lg line-clamp-2">{meeting.title}</h3>
          </div>
          {getStatusBadge(meeting.status)}
        </div>

        <p className="text-blue-100 text-sm font-mono">{meeting.meetingId}</p>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <HiCalendar className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{formatDate(meeting.date)}</span>
          {isToday && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
              Today
            </span>
          )}
          {isUpcoming && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
              Upcoming
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <HiClock className="w-4 h-4 text-green-500" />
          <span>{formatTime(meeting.time)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <HiLocationMarker className="w-4 h-4 text-red-500" />
          <span className="font-medium">{meeting.venue}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium text-gray-800">
            {meeting.meetingType}
          </span>
        </div>

        <div className="text-sm">
          <span className="text-gray-600 font-medium">Agenda:</span>
          <p className="text-gray-800 mt-1 line-clamp-2">{meeting.agenda}</p>
        </div>

        <div className="text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Attendees:</span>
            <button
              onClick={() => setShowAttendees(!showAttendees)}
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              {showAttendees
                ? "Hide"
                : `Show (${meeting.attendees?.length || 0})`}
            </button>
          </div>

          {showAttendees &&
            meeting.attendees &&
            meeting.attendees.length > 0 && (
              <div className="mt-2 space-y-1">
                {meeting.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <HiUsers className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-700">
                      {attendee.name} ({attendee.role})
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>

        {meeting.minutesOfMeeting?.fileName && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
            <HiDocumentText className="w-4 h-4" />
            <span>Minutes uploaded: {meeting.minutesOfMeeting.fileName}</span>
          </div>
        )}

        {meeting.notes && (
          <div className="text-sm">
            <span className="text-gray-600 font-medium">Notes:</span>
            <p className="text-gray-800 mt-1 line-clamp-2">{meeting.notes}</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onViewDetails(meeting)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            <HiEye className="w-4 h-4" />
            <span>View Details</span>
          </button>

          <div className="flex space-x-2">
            {meeting.minutesOfMeeting?.fileName && (
              <button
                onClick={() => onDownloadMinutes(meeting._id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Download Minutes"
              >
                <HiDownload className="w-4 h-4" />
              </button>
            )}

            {canEdit && meeting.status === "scheduled" && (
              <label className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleUploadMinutes}
                  className="hidden"
                />
                <HiDocumentText className="w-4 h-4" />
                <span className="sr-only">Upload Minutes</span>
              </label>
            )}

            {canEdit && meeting.status === "scheduled" && (
              <button
                onClick={() => onEdit(meeting)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Meeting"
              >
                <HiPencil className="w-4 h-4" />
              </button>
            )}

            {canEdit && meeting.status === "scheduled" && (
              <button
                onClick={() => onDelete(meeting._id, false)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancel Meeting"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
