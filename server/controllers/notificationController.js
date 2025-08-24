import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Create notification
export const createNotification = async (req, res) => {
  try {
    const {
      recipient,
      type,
      title,
      message,
      relatedMeeting,
      departmentCode,
      priority = "medium",
      scheduledFor,
    } = req.body;

    // Validate required fields
    if (!recipient || !type || !title || !message || !departmentCode) {
      return res.status(400).json({
        message:
          "Missing required fields: recipient, type, title, message, departmentCode",
      });
    }

    // Validate recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(400).json({ message: "Recipient user not found" });
    }

    // Create notification
    const notification = new Notification({
      recipient,
      type,
      title,
      message,
      relatedMeeting,
      departmentCode,
      priority,
      scheduledFor,
    });

    await notification.save();

    // Populate references
    await notification.populate([
      { path: "recipient", select: "name email" },
      { path: "relatedMeeting", select: "title date time venue" },
    ]);

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = { recipient: req.user._id };

    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate("relatedMeeting", "title date time venue")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount,
    });
  } catch (err) {
    console.error("Error getting user notifications:", err);
    res.status(500).json({ message: err.message });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user owns this notification
    if (!notification.recipient.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Forbidden: not your notification" });
    }

    await notification.markAsRead();

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: err.message });
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user owns this notification
    if (!notification.recipient.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Forbidden: not your notification" });
    }

    await notification.deleteOne();

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get notification stats for a user
export const getNotificationStats = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    const totalCount = await Notification.countDocuments({
      recipient: req.user._id,
    });

    const todayCount = await Notification.countDocuments({
      recipient: req.user._id,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    res.json({
      unreadCount,
      totalCount,
      todayCount,
    });
  } catch (err) {
    console.error("Error getting notification stats:", err);
    res.status(500).json({ message: err.message });
  }
};
