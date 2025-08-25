import React, { useState, useEffect, useRef } from "react";
import {
  useGetUserNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "../../apiSlices/notificationApi";
import NotificationPopup from "./NotificationPopup";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: notificationData, refetch } = useGetUserNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Refetch notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log("🔔 Frontend: Marking notification as read:", notificationId);
      console.log("🔔 Frontend: Making API call...");

      const result = await markAsRead(notificationId);
      console.log("🔔 Frontend: Mark as read result:", result);
      refetch();
    } catch (error) {
      console.error("🔔 Frontend: Error marking notification as read:", error);
      console.error("🔔 Frontend: Error details:", {
        message: error.message,
        status: error.status,
        data: error.data,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refetch();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsPopupOpen(true);
    setIsOpen(false); // Close dropdown when opening popup
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedNotification(null);
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
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
            d="M15 17h5l-5 5v-5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17h6m-6 0V9a3 3 0 013-3h0a3 3 0 013 3v8"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto text-gray-300 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17h6m-6 0V9a3 3 0 013-3h0a3 3 0 013 3v8"
                  />
                </svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400 flex items-center">
                          Click to view details
                          <svg
                            className="w-3 h-3 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>

                      {/* Related Info */}
                      {notification.relatedScholar && (
                        <div className="mt-2 text-xs text-gray-500">
                          Scholar: {notification.relatedScholar.name} (
                          {notification.relatedScholar.rollNo})
                        </div>
                      )}

                      {notification.relatedMeeting && (
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <div>
                            Details: {notification.relatedMeeting.title}
                          </div>
                          {notification.relatedMeeting.venue && (
                            <div>
                              Venue: {notification.relatedMeeting.venue}
                            </div>
                          )}
                          {notification.relatedMeeting.date && (
                            <div>
                              Date:{" "}
                              {new Date(
                                notification.relatedMeeting.date
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          )}
                          {notification.relatedMeeting.time && (
                            <div>Time: {notification.relatedMeeting.time}</div>
                          )}
                          {notification.relatedMeeting.meetingType && (
                            <div>
                              Type: {notification.relatedMeeting.meetingType}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Mark as Read Button */}
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent notification click when clicking mark as read
                          handleMarkAsRead(notification._id);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notification Popup */}
      <NotificationPopup
        notification={selectedNotification}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default NotificationDropdown;
