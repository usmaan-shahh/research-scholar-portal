import mongoose from "mongoose";

const drcMeetingSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        return `DRC-${year}-${month}-${day}-${random}`;
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    date: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    time: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    agenda: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    minutesOfMeeting: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    departmentCode: {
      type: String,
      required: true,
      ref: "Department",
    },
    meetingType: {
      type: String,
      enum: [
        "Monthly Review",
        "Thesis Defense",
        "Research Discussion",
        "Policy Review",
        "Other",
      ],
      default: "Other",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

drcMeetingSchema.virtual("formattedDate").get(function () {
  return this.date
    ? this.date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";
});

drcMeetingSchema.virtual("formattedTime").get(function () {
  return this.time || "N/A";
});

drcMeetingSchema.virtual("statusInfo").get(function () {
  const statusConfig = {
    scheduled: {
      label: "Scheduled",
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
    },
    completed: {
      label: "Completed",
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-200",
    },
    cancelled: {
      label: "Cancelled",
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-200",
    },
  };

  return statusConfig[this.status] || statusConfig.scheduled;
});

drcMeetingSchema.virtual("meetingTypeInfo").get(function () {
  const typeConfig = {
    "Monthly Review": {
      icon: "📊",
      color: "text-blue-600",
    },
    "Thesis Defense": {
      icon: "🎓",
      color: "text-green-600",
    },
    "Research Discussion": {
      icon: "🔬",
      color: "text-purple-600",
    },
    "Policy Review": {
      icon: "📋",
      color: "text-orange-600",
    },
    Other: {
      icon: "📅",
      color: "text-gray-600",
    },
  };

  return typeConfig[this.meetingType] || typeConfig.Other;
});

drcMeetingSchema.index({ departmentCode: 1, date: 1 });
drcMeetingSchema.index({ status: 1, date: 1 });
drcMeetingSchema.index({ createdBy: 1 });
drcMeetingSchema.index({ attendees: 1 });

drcMeetingSchema.pre("save", async function (next) {
  if (this.isNew && !this.meetingId) {
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const generatedId = `DRC-${year}-${month}-${day}-${random}`;

      const existingMeeting = await this.constructor.findOne({
        meetingId: generatedId,
      });
      if (!existingMeeting) {
        this.meetingId = generatedId;
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return next(new Error("Failed to generate unique meeting ID"));
    }
  }
  next();
});

export default mongoose.model("DRCMeeting", drcMeetingSchema);
