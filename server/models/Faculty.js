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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for current supervision load
facultySchema.virtual("currentSupervisionLoad", {
  ref: "Scholar",
  localField: "_id",
  foreignField: "supervisor",
  count: true,
});

// Virtual field for current co-supervision load
facultySchema.virtual("currentCoSupervisionLoad", {
  ref: "Scholar",
  localField: "_id",
  foreignField: "coSupervisor",
  count: true,
});

// Virtual field for total supervision load
facultySchema.virtual("totalSupervisionLoad").get(function () {
  return (
    (this.currentSupervisionLoad || 0) + (this.currentCoSupervisionLoad || 0)
  );
});

// Virtual field for remaining supervision capacity
facultySchema.virtual("remainingSupervisionCapacity").get(function () {
  return Math.max(0, this.maxScholars - (this.totalSupervisionLoad || 0));
});

// Virtual field for supervision eligibility
facultySchema.virtual("isEligibleForSupervision").get(function () {
  // Must have PhD to be eligible
  if (!this.isPhD) {
    return false;
  }

  // Check publication requirements based on designation
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

// Virtual field for supervision capacity status
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

// Virtual field for eligibility reason
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

// Instance method to get supervision eligibility
facultySchema.methods.getSupervisionEligibility = function () {
  return {
    isEligible: this.isEligibleForSupervision,
    reason: this.eligibilityReason,
  };
};

// Instance method to check if can accept more scholars
facultySchema.methods.canAcceptMoreScholars = function () {
  const capacityStatus = this.supervisionCapacityStatus;
  return capacityStatus.canAcceptMore && this.isEligibleForSupervision;
};

// Instance method to get supervision load summary
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

// Pre-save middleware to ensure virtual fields are computed
facultySchema.pre("save", function (next) {
  // This ensures virtual fields are computed
  this.isEligibleForSupervision;
  this.eligibilityReason;
  this.supervisionCapacityStatus;
  next();
});

export default mongoose.model("Faculty", facultySchema);
