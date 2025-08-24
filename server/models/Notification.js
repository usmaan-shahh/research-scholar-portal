import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "meeting_invitation",
        "meeting_update",
        "meeting_cancelled",
        "minutes_uploaded",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedMeeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DRCMeeting",
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    departmentCode: {
      type: String,
      required: true,
      ref: "Department",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    scheduledFor: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ departmentCode: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, isRead: 1 });

// Virtual for time ago
notificationSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function () {
  this.isRead = false;
  return this.save();
};

export default mongoose.model("Notification", notificationSchema);
