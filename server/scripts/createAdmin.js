import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log("Attempting to connect to MongoDB...");
    console.log("Connection string:", process.env.conn_string);
    await mongoose.connect(process.env.conn_string);
    console.log("Connected to MongoDB successfully");

    // Check if admin already exists
    console.log("Checking for existing admin user...");
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin user already exists with email:", adminExists.email);
      process.exit(0);
    }

    // Create admin user
    console.log("Creating new admin user...");
    const adminUser = new User({
      name: "Admin User",
      email: "admin@gmail.com",
      password: "admin123", // The pre-save hook will hash this
      role: "admin",
      department: "Administration",
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    console.log("Email:", adminUser.email);
    console.log("Password: admin123");
    console.log("Role:", adminUser.role);

    // Verify the user was saved
    const savedAdmin = await User.findOne({ email: "admin@gmail.com" });
    console.log(
      "Verification - Admin user found in database:",
      savedAdmin ? "Yes" : "No"
    );
    if (savedAdmin) {
      console.log("Saved admin details:", {
        email: savedAdmin.email,
        role: savedAdmin.role,
        department: savedAdmin.department,
      });
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
 