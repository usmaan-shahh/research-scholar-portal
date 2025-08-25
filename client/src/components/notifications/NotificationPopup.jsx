import React from "react";

const NotificationPopup = ({ notification, isOpen, onClose }) => {
  if (!isOpen || !notification) return null;

  // Close popup when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close popup with Escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "supervisor_assigned":
        return "👨‍🏫";
      case "drc_meeting_attendee":
        return "📅";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "supervisor_assigned":
        return "bg-blue-50 border-blue-200";
      case "drc_meeting_attendee":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-200 scale-100 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${getNotificationColor(
            notification.type
          )}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">
                {getNotificationIcon(notification.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {notification.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatTimeAgo(notification.createdAt)}
                </p>
              </div>
            </div>
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

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 text-base leading-relaxed mb-4">
            {notification.message}
          </p>

          {/* Related Info */}
          {notification.relatedScholar && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Related Scholar
              </h4>
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {notification.relatedScholar.name}
                </p>
                <p>
                  <span className="font-medium">Roll No:</span>{" "}
                  {notification.relatedScholar.rollNo}
                </p>
              </div>
            </div>
          )}

          {notification.relatedMeeting && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Meeting Details
              </h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <span className="font-medium">Title:</span>{" "}
                  {notification.relatedMeeting.title}
                </p>
                {notification.relatedMeeting.venue && (
                  <p>
                    <span className="font-medium">Venue:</span>{" "}
                    {notification.relatedMeeting.venue}
                  </p>
                )}
                {notification.relatedMeeting.date && (
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(
                      notification.relatedMeeting.date
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {notification.relatedMeeting.time && (
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {notification.relatedMeeting.time}
                  </p>
                )}
                {notification.relatedMeeting.agenda && (
                  <p>
                    <span className="font-medium">Agenda:</span>{" "}
                    {notification.relatedMeeting.agenda}
                  </p>
                )}
                {notification.relatedMeeting.meetingType && (
                  <p>
                    <span className="font-medium">Meeting Type:</span>{" "}
                    {notification.relatedMeeting.meetingType}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notification Type */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Notification Type
            </h4>
            <div className="text-sm text-gray-600">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  notification.type === "supervisor_assigned"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {notification.type === "supervisor_assigned"
                  ? "Supervisor Assignment"
                  : "DRC Meeting"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
