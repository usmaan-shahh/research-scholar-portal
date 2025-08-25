import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Scholar from "../models/Scholar.js";
import bcrypt from "bcryptjs";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  const { name, email, password, role, department } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      department,
    });

    // Save user
    const savedUser = await user.save();

    // Generate token
    const token = generateToken(savedUser._id);

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Send response
    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      department: savedUser.department,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;

    const id = (identifier || username || email || "").toLowerCase();
    if (!id || !password) {
      return res
        .status(400)
        .json({ message: "Identifier and password are required" });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ email: id }, { username: id }],
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Send response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      departmentCode: user.departmentCode,
      mustChangePassword: user.mustChangePassword || false,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword are required" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Minimum policy check
    const policy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!policy.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include upper, lower, and a number",
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const createScholarAccount = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      rollNo,
      pgDegree,
      pgCgpa,
      bgDegree,
      bgCgpa,
      regId,
      dateOfAdmission,
      dateOfJoining,
      areaOfResearch,
      synopsisTitle,
      departmentCode,
      username,
      password,
    } = req.body;

    // Check if user exists by email or username
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    // Check if scholar profile exists by rollNo, regId, or email
    const existingScholar = await Scholar.findOne({
      $or: [{ rollNo }, { regId }, { email }],
    });
    if (existingScholar) {
      return res.status(400).json({
        message:
          "Scholar profile with this roll number, registration ID, or email already exists",
      });
    }

    // Create user account
    const user = new User({
      name,
      email,
      username,
      password,
      role: "scholar",
      department: departmentCode,
      departmentCode,
      mustChangePassword: true, // Force password change on first login
    });

    const savedUser = await user.save();

    // Create scholar profile
    const scholar = new Scholar({
      name,
      email,
      phone,
      address,
      rollNo,
      pgDegree,
      pgCgpa,
      bgDegree,
      bgCgpa,
      regId,
      dateOfAdmission,
      dateOfJoining,
      areaOfResearch,
      synopsisTitle,
      departmentCode,
      supervisor: null, // Will be assigned later
      coSupervisor: null, // Will be assigned later
      hasUserAccount: true, // Mark as having user account
      userAccountId: savedUser._id, // Link to user account
    });

    const savedScholar = await scholar.save();

    // Update the scholar to mark it as having a user account
    await Scholar.findByIdAndUpdate(savedScholar._id, {
      hasUserAccount: true,
      userAccountId: savedUser._id,
    });

    // Generate token for the new user
    const token = generateToken(savedUser._id);

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Send response
    res.status(201).json({
      message: "Scholar account created successfully",
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        username: savedUser.username,
        role: savedUser.role,
        department: savedUser.department,
        departmentCode: savedUser.departmentCode,
        mustChangePassword: savedUser.mustChangePassword,
      },
      scholar: {
        _id: savedScholar._id,
        name: savedScholar.name,
        rollNo: savedScholar.rollNo,
        regId: savedScholar.regId,
        departmentCode: savedScholar.departmentCode,
      },
      token,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    console.error("Error creating scholar account:", error);
    res.status(500).json({ message: "Error creating scholar account" });
  }
};
