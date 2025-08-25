import React, { useState, useEffect } from "react";
import { useGetUserNotificationsQuery } from "../../apiSlices/notificationApi";

const NotificationBadge = () => {
  const { data: notificationData, refetch } = useGetUserNotificationsQuery();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (notificationData?.unreadCount !== undefined) {
      setUnreadCount(notificationData.unreadCount);
    }
  }, [notificationData]);

  // Refetch notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (unreadCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
        {unreadCount > 99 ? "99+" : unreadCount}
      </div>
    </div>
  );
};

export default NotificationBadge;
