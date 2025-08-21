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

// Pre-save middleware to ensure virtual fields are computed
facultySchema.pre("save", function (next) {
  // This ensures virtual fields are computed
  this.isEligibleForSupervision;
  this.eligibilityReason;
  next();
});

export default mongoose.model("Faculty", facultySchema);
