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
  { timestamps: true }
);

export default mongoose.model("Faculty", facultySchema);
