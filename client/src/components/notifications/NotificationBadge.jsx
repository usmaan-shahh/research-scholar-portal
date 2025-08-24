import React from "react";
import { useGetNotificationStatsQuery } from "../../apiSlices/notificationApi";

const NotificationBadge = ({ className = "" }) => {
  const { data: stats } = useGetNotificationStatsQuery();
  const unreadCount = stats?.unreadCount || 0;

  if (unreadCount === 0) return null;

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
};

export default NotificationBadge;
