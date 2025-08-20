import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.conn_string);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

export default connectDB;
