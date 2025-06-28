import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    code: {
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
    address: {
      type: String,
      trim: true,
    },
    block: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
