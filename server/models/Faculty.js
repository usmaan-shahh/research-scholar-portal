import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    departmentCode: {
      type: String,
      required: true,
      ref: "Department",
    },
    designation: {
      type: String,
      required: true,
      enum: ["Professor", "Associate Professor", "Assistant Professor"],
    },
    isPhD: {
      type: Boolean,
      required: true,
    },
    maxScholars: {
      type: Number,
      required: true,
    },
    numberOfPublications: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    username: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    hasUserAccount: {
      type: Boolean,
      default: false,
    },
    userAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

facultySchema.virtual("currentSupervisionLoad", {
  ref: "Scholar",
  localField: "_id",
  foreignField: "supervisor",
  count: true,
});

facultySchema.virtual("currentCoSupervisionLoad", {
  ref: "Scholar",
  localField: "_id",
  foreignField: "coSupervisor",
  count: true,
});

facultySchema.virtual("totalSupervisionLoad").get(function () {
  return (
    (this.currentSupervisionLoad || 0) + (this.currentCoSupervisionLoad || 0)
  );
});

facultySchema.virtual("remainingSupervisionCapacity").get(function () {
  return Math.max(0, this.maxScholars - (this.totalSupervisionLoad || 0));
});

facultySchema.virtual("isEligibleForSupervision").get(function () {
  if (!this.isPhD) {
    return false;
  }

  switch (this.designation) {
    case "Professor":
    case "Associate Professor":
      return this.numberOfPublications > 5;
    case "Assistant Professor":
      return this.numberOfPublications > 3;
    default:
      return false;
  }
});

facultySchema.virtual("supervisionCapacityStatus").get(function () {
  const currentLoad = this.totalSupervisionLoad || 0;
  const maxLoad = this.maxScholars;
  const remaining = this.remainingSupervisionCapacity || 0;

  if (currentLoad >= maxLoad) {
    return {
      status: "full",
      message: `Maximum supervision capacity reached (${currentLoad}/${maxLoad})`,
      canAcceptMore: false,
      severity: "error",
    };
  } else if (remaining <= 2) {
    return {
      status: "near_limit",
      message: `Near supervision limit (${currentLoad}/${maxLoad}, ${remaining} remaining)`,
      canAcceptMore: true,
      severity: "warning",
    };
  } else {
    return {
      status: "available",
      message: `Available for supervision (${currentLoad}/${maxLoad}, ${remaining} remaining)`,
      canAcceptMore: true,
      severity: "success",
    };
  }
});

facultySchema.virtual("eligibilityReason").get(function () {
  if (!this.isPhD) {
    return "PhD required for supervision";
  }

  switch (this.designation) {
    case "Professor":
    case "Associate Professor":
      return this.numberOfPublications > 5
        ? "Eligible for supervision"
        : `Requires more than 5 publications (current: ${this.numberOfPublications})`;
    case "Assistant Professor":
      return this.numberOfPublications > 3
        ? "Eligible for supervision"
        : `Requires more than 3 publications (current: ${this.numberOfPublications})`;
    default:
      return "Invalid designation";
  }
});

facultySchema.methods.getSupervisionEligibility = function () {
  return {
    isEligible: this.isEligibleForSupervision,
    reason: this.eligibilityReason,
  };
};

facultySchema.methods.canAcceptMoreScholars = function () {
  const capacityStatus = this.supervisionCapacityStatus;
  return capacityStatus.canAcceptMore && this.isEligibleForSupervision;
};

facultySchema.methods.getSupervisionLoadSummary = function () {
  return {
    currentLoad: this.totalSupervisionLoad || 0,
    maxCapacity: this.maxScholars,
    remainingCapacity: this.remainingSupervisionCapacity || 0,
    capacityStatus: this.supervisionCapacityStatus,
    isEligible: this.isEligibleForSupervision,
    eligibilityReason: this.eligibilityReason,
  };
};

facultySchema.pre("save", function (next) {
  this.isEligibleForSupervision;
  this.eligibilityReason;
  this.supervisionCapacityStatus;
  next();
});

export default mongoose.model("Faculty", facultySchema);
