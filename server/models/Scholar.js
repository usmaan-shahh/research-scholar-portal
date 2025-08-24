import mongoose from "mongoose";

const scholarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    rollNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    pgDegree: {
      type: String,
      required: true,
      trim: true,
    },
    pgCgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    bgDegree: {
      type: String,
      required: true,
      trim: true,
    },
    bgCgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    regId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    dateOfAdmission: {
      type: Date,
      required: true,
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    areaOfResearch: {
      type: String,
      required: true,
      trim: true,
    },
    synopsisTitle: {
      type: String,
      required: true,
      trim: true,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: false,
    },
    coSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: false,
    },
    departmentCode: {
      type: String,
      required: true,
      ref: "Department",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

scholarSchema.index({ departmentCode: 1, isActive: 1 });

export default mongoose.model("Scholar", scholarSchema);
