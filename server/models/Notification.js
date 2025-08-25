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
      enum: ["supervisor_assigned", "drc_meeting_attendee"],
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
    relatedScholar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scholar",
      required: false,
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
      default: "CS", // CS department only
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

export default mongoose.model("Notification", notificationSchema);
