import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Faculty from "../models/Faculty.js";

// Create notification for supervisor assignment
export const createSupervisorAssignmentNotification = async (
  facultyId,
  scholarId,
  createdBy
) => {
  try {
    // Get faculty details
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      throw new Error("Faculty not found");
    }

    // Get faculty user account
    const facultyUser = await User.findById(faculty.userAccountId);
    if (!facultyUser) {
      throw new Error("Faculty user account not found");
    }

    // Check if faculty is from CS department
    if (faculty.departmentCode !== "CS") {
      return; // Only notify CS department faculty
    }

    // Create notification
    const notification = new Notification({
      recipient: facultyUser._id,
      type: "supervisor_assigned",
      title: "New Scholar Assignment",
      message: `You have been assigned as a supervisor for a new research scholar. Please review the assignment details.`,
      relatedScholar: scholarId,
      departmentCode: "CS",
      createdBy: createdBy,
    });

    await notification.save();
    console.log(
      `Notification created for faculty ${faculty.name} (${faculty.employeeCode})`
    );

    return notification;
  } catch (error) {
    console.error("Error creating supervisor assignment notification:", error);
    throw error;
  }
};

// Create notification for DRC meeting attendee
export const createDRCMeetingAttendeeNotification = async (
  facultyId,
  meetingId,
  createdBy
) => {
  try {
    // Get faculty details
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      throw new Error("Faculty not found");
    }

    // Get faculty user account
    const facultyUser = await User.findById(faculty.userAccountId);
    if (!facultyUser) {
      throw new Error("Faculty user account not found");
    }

    // Check if faculty is from CS department
    if (faculty.departmentCode !== "CS") {
      return; // Only notify CS department faculty
    }

    // Get meeting details
    const meeting = await mongoose.model("DRCMeeting").findById(meetingId);
    if (!meeting) {
      throw new Error("DRC Meeting not found");
    }

    // Create notification
    const notification = new Notification({
      recipient: facultyUser._id,
      type: "drc_meeting_attendee",
      title: "DRC Meeting Invitation",
      message: `You have been invited to attend the DRC meeting: ${
        meeting.title
      } on ${meeting.date.toLocaleDateString()}.`,
      relatedMeeting: meetingId,
      departmentCode: "CS",
      createdBy: createdBy,
    });

    await notification.save();
    console.log(
      `DRC meeting notification created for faculty ${faculty.name} (${faculty.employeeCode})`
    );

    return notification;
  } catch (error) {
    console.error("Error creating DRC meeting attendee notification:", error);
    throw error;
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
      .populate("relatedScholar", "name rollNo synopsisTitle")
      .populate("relatedMeeting", "title date time venue")
      .populate("createdBy", "name")
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
    console.log("🔔 Marking notification as read:", req.params.id);
    console.log("🔔 User ID:", req.user._id);

    const notification = await Notification.findById(req.params.id);
    console.log("🔔 Found notification:", notification);

    if (!notification) {
      console.log("🔔 Notification not found");
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user owns this notification
    console.log("🔔 Notification recipient:", notification.recipient);
    console.log("🔔 Current user:", req.user._id);
    console.log(
      "🔔 Are they equal?",
      notification.recipient.equals(req.user._id)
    );

    if (!notification.recipient.equals(req.user._id)) {
      console.log("🔔 Forbidden: user doesn't own this notification");
      return res
        .status(403)
        .json({ message: "Forbidden: not your notification" });
    }

    console.log("🔔 Marking notification as read...");
    const result = await notification.markAsRead();
    console.log("🔔 Mark as read result:", result);

    res.json({
      message: "Notification marked as read",
      notification: result,
    });
  } catch (err) {
    console.error("🔔 Error marking notification as read:", err);
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
