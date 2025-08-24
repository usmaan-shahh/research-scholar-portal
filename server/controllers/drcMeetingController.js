import DRCMeeting from "../models/DRCMeeting.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to validate date
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

// Helper function to check if user can access meeting
const canAccessMeeting = (user, meeting) => {
  // Admin can access all meetings
  if (user.role === "admin") return true;

  // DRC Chair can access meetings in their department
  if (
    user.role === "drc_chair" &&
    user.departmentCode === meeting.departmentCode
  )
    return true;

  // Main office can access meetings in their department
  if (
    user.role === "main_office" &&
    user.departmentCode === meeting.departmentCode
  )
    return true;

  // Users can access meetings they're attending or created
  if (
    meeting.attendees.includes(user._id) ||
    meeting.createdBy.equals(user._id)
  )
    return true;

  return false;
};

// Create new DRC Meeting
export const createMeeting = async (req, res) => {
  try {
    const {
      title,
      date,
      venue,
      time,
      agenda,
      attendees,
      departmentCode,
      meetingType,
      notes,
    } = req.body;

    // Validate required fields
    if (!title || !date || !venue || !time || !agenda || !departmentCode) {
      return res.status(400).json({
        message:
          "Missing required fields: title, date, venue, time, agenda, departmentCode",
      });
    }

    // Validate date
    const meetingDate = new Date(date);
    if (!isValidDate(meetingDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Check if date is in the future
    if (meetingDate < new Date()) {
      return res
        .status(400)
        .json({ message: "Meeting date cannot be in the past" });
    }

    // Validate department exists
    const department = await Department.findOne({ code: departmentCode });
    if (!department) {
      return res.status(400).json({ message: "Invalid department code" });
    }

    // Validate attendees if provided
    if (attendees && attendees.length > 0) {
      const validAttendees = await User.find({
        _id: { $in: attendees },
        departmentCode: departmentCode,
      });

      if (validAttendees.length !== attendees.length) {
        return res
          .status(400)
          .json({
            message:
              "Some attendees are invalid or not in the specified department",
          });
      }
    }

    // Create meeting
    const meeting = new DRCMeeting({
      title,
      date: meetingDate,
      venue,
      time,
      agenda,
      attendees: attendees || [],
      departmentCode,
      meetingType: meetingType || "Other",
      notes,
      createdBy: req.user._id,
    });

    await meeting.save();

    // Populate references
    await meeting.populate([
      { path: "attendees", select: "name email role" },
      { path: "createdBy", select: "name email role" },
    ]);

    res.status(201).json({
      message: "DRC Meeting created successfully",
      meeting,
    });
  } catch (err) {
    console.error("Error creating DRC meeting:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all DRC Meetings with filtering
export const getMeetings = async (req, res) => {
  try {
    const {
      status,
      departmentCode,
      startDate,
      endDate,
      meetingType,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    let filter = { isActive: true };

    // Department filter
    if (departmentCode) {
      filter.departmentCode = departmentCode;
    } else if (req.user.role !== "admin") {
      // Non-admin users can only see meetings in their department
      filter.departmentCode = req.user.departmentCode;
    }

    // Status filter
    if (status && ["scheduled", "completed", "cancelled"].includes(status)) {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Meeting type filter
    if (meetingType) {
      filter.meetingType = meetingType;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { agenda: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get meetings with pagination
    const meetings = await DRCMeeting.find(filter)
      .populate("attendees", "name email role")
      .populate("createdBy", "name email role")
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await DRCMeeting.countDocuments(filter);

    // Get upcoming meetings (next 7 days)
    const upcomingFilter = {
      ...filter,
      date: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      status: "scheduled",
    };
    const upcomingCount = await DRCMeeting.countDocuments(upcomingFilter);

    // Get today's meetings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFilter = {
      ...filter,
      date: { $gte: today, $lt: tomorrow },
      status: "scheduled",
    };
    const todayCount = await DRCMeeting.countDocuments(todayFilter);

    res.json({
      meetings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + meetings.length < total,
        hasPrev: parseInt(page) > 1,
      },
      summary: {
        upcoming: upcomingCount,
        today: todayCount,
        total,
      },
    });
  } catch (err) {
    console.error("Error getting DRC meetings:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get specific meeting by ID
export const getMeetingById = async (req, res) => {
  try {
    const meeting = await DRCMeeting.findById(req.params.id)
      .populate("attendees", "name email role departmentCode")
      .populate("createdBy", "name email role departmentCode");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check access permissions
    if (!canAccessMeeting(req.user, meeting)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(meeting);
  } catch (err) {
    console.error("Error getting meeting by ID:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update meeting details
export const updateMeeting = async (req, res) => {
  try {
    const meeting = await DRCMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check permissions - only creator or admin can update
    if (!req.user.role === "admin" && !meeting.createdBy.equals(req.user._id)) {
      return res
        .status(403)
        .json({
          message: "Only the meeting creator or admin can update this meeting",
        });
    }

    // Check if meeting can be updated
    if (meeting.status === "completed") {
      return res
        .status(400)
        .json({ message: "Completed meetings cannot be updated" });
    }

    const { title, date, venue, time, agenda, attendees, meetingType, notes } =
      req.body;

    // Validate date if provided
    if (date) {
      const meetingDate = new Date(date);
      if (!isValidDate(meetingDate)) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      if (meetingDate < new Date()) {
        return res
          .status(400)
          .json({ message: "Meeting date cannot be in the past" });
      }
      meeting.date = meetingDate;
    }

    // Validate attendees if provided
    if (attendees && attendees.length > 0) {
      const validAttendees = await User.find({
        _id: { $in: attendees },
        departmentCode: meeting.departmentCode,
      });

      if (validAttendees.length !== attendees.length) {
        return res
          .status(400)
          .json({
            message:
              "Some attendees are invalid or not in the specified department",
          });
      }
      meeting.attendees = attendees;
    }

    // Update fields
    if (title) meeting.title = title;
    if (venue) meeting.venue = venue;
    if (time) meeting.time = time;
    if (agenda) meeting.agenda = agenda;
    if (meetingType) meeting.meetingType = meetingType;
    if (notes !== undefined) meeting.notes = notes;

    await meeting.save();

    // Populate references
    await meeting.populate([
      { path: "attendees", select: "name email role" },
      { path: "createdBy", select: "name email role" },
    ]);

    res.json({
      message: "Meeting updated successfully",
      meeting,
    });
  } catch (err) {
    console.error("Error updating meeting:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete/Cancel meeting
export const deleteMeeting = async (req, res) => {
  try {
    const { permanent } = req.query;
    const meeting = await DRCMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check permissions - only creator or admin can delete
    if (!req.user.role === "admin" && !meeting.createdBy.equals(req.user._id)) {
      return res
        .status(403)
        .json({
          message: "Only the meeting creator or admin can delete this meeting",
        });
    }

    if (permanent === "true") {
      // Permanent delete - only admin
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admin can permanently delete meetings" });
      }

      // Remove minutes file if exists
      if (meeting.minutesOfMeeting?.filePath) {
        const filePath = path.join(
          __dirname,
          "..",
          meeting.minutesOfMeeting.filePath
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await DRCMeeting.findByIdAndDelete(req.params.id);
      res.json({ message: "Meeting permanently deleted" });
    } else {
      // Soft delete (cancel meeting)
      if (meeting.status === "completed") {
        return res
          .status(400)
          .json({ message: "Completed meetings cannot be cancelled" });
      }

      meeting.status = "cancelled";
      meeting.isActive = false;
      await meeting.save();

      res.json({ message: "Meeting cancelled successfully" });
    }
  } catch (err) {
    console.error("Error deleting meeting:", err);
    res.status(500).json({ message: err.message });
  }
};

// Upload meeting minutes PDF
export const uploadMinutes = async (req, res) => {
  try {
    const meeting = await DRCMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check permissions - only creator, admin, or attendees can upload minutes
    if (
      !req.user.role === "admin" &&
      !meeting.createdBy.equals(req.user._id) &&
      !meeting.attendees.includes(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file type
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    // Remove old file if exists
    if (meeting.minutesOfMeeting?.filePath) {
      const oldFilePath = path.join(
        __dirname,
        "..",
        meeting.minutesOfMeeting.filePath
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update meeting with new file info
    meeting.minutesOfMeeting = {
      fileName: req.file.originalname,
      filePath: `uploads/minutes/${req.file.filename}`,
      uploadedAt: new Date(),
      uploadedBy: req.user._id,
    };

    // Update status to completed if it was scheduled
    if (meeting.status === "scheduled") {
      meeting.status = "completed";
    }

    await meeting.save();

    res.json({
      message: "Meeting minutes uploaded successfully",
      meeting,
    });
  } catch (err) {
    console.error("Error uploading minutes:", err);
    res.status(500).json({ message: err.message });
  }
};

// Download meeting minutes PDF
export const downloadMinutes = async (req, res) => {
  try {
    const meeting = await DRCMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check access permissions
    if (!canAccessMeeting(req.user, meeting)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!meeting.minutesOfMeeting?.filePath) {
      return res
        .status(404)
        .json({ message: "No minutes file found for this meeting" });
    }

    const filePath = path.join(
      __dirname,
      "..",
      meeting.minutesOfMeeting.filePath
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Minutes file not found" });
    }

    res.download(filePath, meeting.minutesOfMeeting.fileName);
  } catch (err) {
    console.error("Error downloading minutes:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get meeting statistics
export const getMeetingStats = async (req, res) => {
  try {
    const { departmentCode } = req.query;
    let filter = { isActive: true };

    // Department filter
    if (departmentCode) {
      filter.departmentCode = departmentCode;
    } else if (req.user.role !== "admin") {
      filter.departmentCode = req.user.departmentCode;
    }

    // Get current date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Aggregate statistics
    const stats = await DRCMeeting.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          scheduled: {
            $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          thisMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$date", thisMonth] },
                    { $lt: ["$date", nextMonth] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          today: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$date", today] },
                    {
                      $lt: [
                        "$date",
                        new Date(today.getTime() + 24 * 60 * 60 * 1000),
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Get meeting type distribution
    const typeStats = await DRCMeeting.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$meetingType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get upcoming meetings (next 7 days)
    const upcomingFilter = {
      ...filter,
      date: {
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      status: "scheduled",
    };
    const upcomingMeetings = await DRCMeeting.find(upcomingFilter)
      .populate("attendees", "name")
      .sort({ date: 1, time: 1 })
      .limit(5);

    const result = {
      summary: stats[0] || {
        total: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        thisMonth: 0,
        today: 0,
      },
      typeDistribution: typeStats,
      upcomingMeetings,
    };

    res.json(result);
  } catch (err) {
    console.error("Error getting meeting statistics:", err);
    res.status(500).json({ message: err.message });
  }
};
