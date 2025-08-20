import User from "../models/User.js";
import Department from "../models/Department.js";
import crypto from "crypto";

export const getUsers = async (req, res) => {
  console.log("=== getUsers function called ===");
  console.log("Request user:", req.user);

  try {
    console.log("Attempting to fetch users from database...");
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log("Users found:", users.length);
    console.log("First user (if any):", users[0]);

    if (!users || users.length === 0) {
      console.log("No users found in database");
      return res.status(200).json([]);
    }

    console.log("Sending response with users");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, password, role, isActive } = req.body;

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    // Update password if provided
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete the last admin user",
        });
      }
    }

    await user.deleteOne();
    res.status(200).json({ message: "User removed" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

const generateTempPassword = () =>
  crypto
    .randomBytes(9)
    .toString("base64")
    .replace(/[^A-Za-z0-9]/g, "A")
    .slice(0, 12);

export const createMainOfficeUser = async (req, res) => {
  try {
    const { departmentCode, tempPassword } = req.body;
    if (!departmentCode) {
      return res.status(400).json({ message: "departmentCode is required" });
    }

    const department = await Department.findOne({ code: departmentCode });
    if (!department) {
      return res.status(400).json({ message: "Invalid department code" });
    }

    const username = `office_${departmentCode.toLowerCase()}`;

    const existing = await User.findOne({
      role: "main_office",
      departmentCode,
    });
    if (existing) {
      return res
        .status(409)
        .json({
          message: `Main Office User already exists for ${departmentCode}`,
        });
    }

    const password = tempPassword || generateTempPassword();

    const user = await User.create({
      name: `Main Office ${department.name}`,
      email: `${username}@example.com`,
      username,
      password,
      role: "main_office",
      department: department.name,
      departmentCode,
      isActive: true,
      mustChangePassword: true,
    });

    return res.status(201).json({
      id: user._id,
      username: user.username,
      departmentCode: user.departmentCode,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      tempPassword: tempPassword ? undefined : password,
    });
  } catch (error) {
    console.error("createMainOfficeUser error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetMainOfficePassword = async (req, res) => {
  try {
    const { departmentCode, tempPassword } = req.body;
    if (!departmentCode) {
      return res.status(400).json({ message: "departmentCode is required" });
    }

    const user = await User.findOne({ role: "main_office", departmentCode });
    if (!user) {
      return res.status(404).json({ message: "Main Office User not found" });
    }

    const newPassword = tempPassword || generateTempPassword();
    user.password = newPassword;
    user.mustChangePassword = true;
    await user.save();

    return res.status(200).json({
      id: user._id,
      username: user.username,
      departmentCode: user.departmentCode,
      mustChangePassword: user.mustChangePassword,
      tempPassword: tempPassword ? undefined : newPassword,
    });
  } catch (error) {
    console.error("resetMainOfficePassword error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
