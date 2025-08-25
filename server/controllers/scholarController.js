import Scholar from "../models/Scholar.js";
import Faculty from "../models/Faculty.js";
import Department from "../models/Department.js";
import {
  validateSupervisorAssignment,
  refreshFacultySupervisionData,
} from "../utils/supervisionValidation.js";
import { createSupervisorAssignmentNotification } from "./notificationController.js";
import User from "../models/User.js"; // Added import for User model
import jwt from "jsonwebtoken"; // Added import for jwt

// Helper function to create supervisor assignment notifications
const createSupervisorAssignmentNotifications = async (
  scholar,
  oldSupervisor,
  newSupervisor,
  oldCoSupervisor,
  newCoSupervisor,
  departmentCode,
  createdBy
) => {
  try {
    // Only create notifications for CS department
    if (departmentCode !== "CS") {
      console.log(
        "Skipping notifications for non-CS department:",
        departmentCode
      );
      return;
    }

    // Notify new supervisor
    if (newSupervisor && newSupervisor !== oldSupervisor) {
      try {
        await createSupervisorAssignmentNotification(
          newSupervisor,
          scholar._id,
          createdBy
        );
        console.log(
          `Supervisor assignment notification created for faculty ${newSupervisor}`
        );
      } catch (error) {
        console.error(
          "Error creating supervisor assignment notification:",
          error
        );
      }
    }

    // Notify new co-supervisor
    if (newCoSupervisor && newCoSupervisor !== oldCoSupervisor) {
      try {
        await createSupervisorAssignmentNotification(
          newCoSupervisor,
          scholar._id,
          createdBy
        );
        console.log(
          `Co-supervisor assignment notification created for faculty ${newCoSupervisor}`
        );
      } catch (error) {
        console.error(
          "Error creating co-supervisor assignment notification:",
          error
        );
      }
    }

    console.log("Supervisor assignment notifications completed");
  } catch (error) {
    console.error("Error creating supervisor assignment notifications:", error);
    // Don't fail the scholar operation if notifications fail
  }
};

// Create Scholar
export const createScholar = async (req, res) => {
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
      supervisor: originalSupervisor,
      coSupervisor: originalCoSupervisor,
      departmentCode,
    } = req.body;

    // RBAC: main_office and drc_chair can only create within their department
    if (
      (req.user?.role === "main_office" || req.user?.role === "drc_chair") &&
      req.user.departmentCode !== departmentCode
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: department mismatch" });
    }

    // Check if rollNo already exists
    const existingRollNo = await Scholar.findOne({ rollNo });
    if (existingRollNo) {
      return res.status(400).json({ message: "Roll number already exists" });
    }

    // Check if regId already exists
    const existingRegId = await Scholar.findOne({ regId });
    if (existingRegId) {
      return res
        .status(400)
        .json({ message: "Registration ID already exists" });
    }

    // Check if email already exists
    const existingEmail = await Scholar.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate department exists
    const department = await Department.findOne({ code: departmentCode });
    if (!department) {
      return res.status(400).json({ message: "Invalid department code" });
    }

    // For main_office staff and drc_chair, supervisor is optional
    let finalSupervisor = originalSupervisor;
    let finalCoSupervisor = originalCoSupervisor;

    if (req.user?.role === "main_office" || req.user?.role === "drc_chair") {
      // Set supervisor and coSupervisor to null for main_office staff and drc_chair
      // They can assign supervisors later
      finalSupervisor = null;
      finalCoSupervisor = null;
    } else {
      // For other roles, supervisor is required
      if (!finalSupervisor) {
        return res.status(400).json({ message: "Supervisor is required" });
      }

      // Validate supervisor assignment with supervision load
      const supervisorValidation = await validateSupervisorAssignment(
        finalSupervisor,
        finalCoSupervisor,
        "assign"
      );

      if (!supervisorValidation.overallValid) {
        return res.status(400).json({
          message: "Supervisor assignment validation failed",
          errors: supervisorValidation.errors,
          warnings: supervisorValidation.warnings,
        });
      }

      // Check if there are warnings (optional - can proceed but inform user)
      if (supervisorValidation.warnings.length > 0) {
        console.log(
          "Supervisor assignment warnings:",
          supervisorValidation.warnings
        );
      }
    }

    const scholar = await Scholar.create({
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
      supervisor: finalSupervisor,
      coSupervisor: finalCoSupervisor,
      departmentCode,
    });

    console.log("Created scholar:", {
      id: scholar._id,
      name: scholar.name,
      departmentCode: scholar.departmentCode,
      isActive: scholar.isActive,
      supervisor: scholar.supervisor,
      coSupervisor: scholar.coSupervisor,
    });

    // Create notifications for supervisor assignments if any
    if (scholar.supervisor || scholar.coSupervisor) {
      await createSupervisorAssignmentNotifications(
        scholar,
        null, // oldSupervisor
        scholar.supervisor, // newSupervisor
        null, // oldCoSupervisor
        scholar.coSupervisor, // newCoSupervisor
        scholar.departmentCode,
        req.user._id // createdBy
      );
    }

    // Populate supervisor and co-supervisor details
    await scholar.populate([
      { path: "supervisor", select: "name designation" },
      { path: "coSupervisor", select: "name designation" },
    ]);

    // Refresh faculty supervision data after successful creation
    const facultyIdsToRefresh = [];
    if (finalSupervisor) facultyIdsToRefresh.push(finalSupervisor);
    if (finalCoSupervisor) facultyIdsToRefresh.push(finalCoSupervisor);
    await refreshFacultySupervisionData(facultyIdsToRefresh);

    res.status(201).json(scholar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Scholars (with optional filters)
export const getScholars = async (req, res) => {
  try {
    const { departmentCode, isActive, supervisor, coSupervisor, email } =
      req.query;
    let filter = {};

    if (departmentCode) filter.departmentCode = departmentCode;
    if (isActive !== undefined && isActive !== "")
      filter.isActive = isActive === "true";
    if (email) filter.email = email;

    // Handle supervisor and coSupervisor filtering
    if (supervisor && supervisor !== "") {
      // Always use $or to find scholars where user is either supervisor or coSupervisor
      filter.$or = [{ supervisor: supervisor }, { coSupervisor: supervisor }];
    }

    // RBAC: main_office and drc_chair only see own department
    // But don't overwrite if they're explicitly querying for a different department
    if (req.user?.role === "main_office" || req.user?.role === "drc_chair") {
      // If no departmentCode is specified in query, use user's department
      // If departmentCode is specified, validate it matches user's department
      if (!departmentCode) {
        filter.departmentCode = req.user.departmentCode;
      } else if (departmentCode !== req.user.departmentCode) {
        return res.status(403).json({
          message:
            "Forbidden: You can only access scholars from your department",
        });
      }
    }

    // For supervisor role, also apply department filtering if they have a department
    if (req.user?.role === "supervisor" && req.user?.departmentCode) {
      if (!departmentCode) {
        filter.departmentCode = req.user.departmentCode;
      }
    }

    // For scholar role, they can only see their own data
    if (req.user?.role === "scholar") {
      // If email is provided in query, use it; otherwise, use the logged-in user's email
      if (!email) {
        filter.email = req.user.email;
      }
      // Scholars can only see their own data, so no additional filtering needed
    }

    console.log("Backend filter:", filter);
    console.log("User role:", req.user?.role);
    console.log("User department:", req.user?.departmentCode);
    console.log("User ID:", req.user?._id);
    console.log("Query params:", req.query);
    console.log("Email filter:", email);
    console.log("Supervisor filter:", supervisor);
    console.log("CoSupervisor filter:", coSupervisor);
    console.log("Final MongoDB filter:", JSON.stringify(filter, null, 2));

    const scholars = await Scholar.find(filter)
      .populate("supervisor", "name designation")
      .populate("coSupervisor", "name designation")
      .sort({ createdAt: -1 });

    console.log("Found scholars count:", scholars.length);
    console.log(
      "Scholar departments:",
      scholars.map((s) => ({ id: s._id, dept: s.departmentCode }))
    );
    console.log(
      "Scholar supervisors:",
      scholars.map((s) => ({
        id: s._id,
        supervisor: s.supervisor,
        coSupervisor: s.coSupervisor,
      }))
    );

    // Debug: Let's also see ALL scholars to understand the data
    const allScholars = await Scholar.find({})
      .populate("supervisor", "name designation")
      .populate("coSupervisor", "name designation");
    console.log(
      "All scholars in database:",
      allScholars.map((s) => ({
        id: s._id,
        name: s.name,
        supervisor: s.supervisor?._id || s.supervisor,
        coSupervisor: s.coSupervisor?._id || s.coSupervisor,
        department: s.departmentCode,
      }))
    );

    res.json(scholars);
  } catch (err) {
    console.error("getScholars error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get Scholar by ID
export const getScholarById = async (req, res) => {
  try {
    const scholar = await Scholar.findById(req.params.id)
      .populate("supervisor", "name designation")
      .populate("coSupervisor", "name designation");

    if (!scholar) {
      return res.status(404).json({ message: "Scholar not found" });
    }

    // RBAC: main_office and drc_chair can only access scholars in their department
    if (
      (req.user?.role === "main_office" || req.user?.role === "drc_chair") &&
      scholar.departmentCode !== req.user.departmentCode
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(scholar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Scholar
export const updateScholar = async (req, res) => {
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
      supervisor: originalSupervisor,
      coSupervisor: originalCoSupervisor,
      departmentCode,
      isActive,
    } = req.body;

    const existingScholar = await Scholar.findById(req.params.id);
    if (!existingScholar) {
      return res.status(404).json({ message: "Scholar not found" });
    }

    // RBAC: main_office and drc_chair can only update scholars in their department
    if (
      (req.user?.role === "main_office" || req.user?.role === "drc_chair") &&
      existingScholar.departmentCode !== req.user.departmentCode
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check for duplicate rollNo (if changed)
    if (rollNo && rollNo !== existingScholar.rollNo) {
      const duplicateRollNo = await Scholar.findOne({
        rollNo,
        _id: { $ne: req.params.id },
      });
      if (duplicateRollNo) {
        return res.status(400).json({ message: "Roll number already exists" });
      }
    }

    // Check for duplicate regId (if changed)
    if (regId && regId !== existingScholar.regId) {
      const duplicateRegId = await Scholar.findOne({
        regId,
        _id: { $ne: req.params.id },
      });
      if (duplicateRegId) {
        return res
          .status(400)
          .json({ message: "Registration ID already exists" });
      }
    }

    // Check for duplicate email (if changed)
    if (email && email !== existingScholar.email) {
      const duplicateEmail = await Scholar.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (duplicateEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Validate department if changed
    if (departmentCode && departmentCode !== existingScholar.departmentCode) {
      const department = await Department.findOne({ code: departmentCode });
      if (!department) {
        return res.status(400).json({ message: "Invalid department code" });
      }
    }

    // Validate supervisor and co-supervisor if changed
    let finalSupervisor = originalSupervisor;
    let finalCoSupervisor = originalCoSupervisor;

    if (finalSupervisor && finalSupervisor !== existingScholar.supervisor) {
      // For main_office staff and drc_chair, supervisor is optional
      if (req.user?.role === "main_office" || req.user?.role === "drc_chair") {
        // Allow main_office staff and drc_chair to set supervisors
        // But validate the supervisor if they do set one
        if (finalSupervisor) {
          // Validate supervisor assignment with supervision load
          const supervisorValidation = await validateSupervisorAssignment(
            finalSupervisor,
            finalCoSupervisor,
            "change",
            req.params.id
          );

          if (!supervisorValidation.overallValid) {
            return res.status(400).json({
              message: "Supervisor assignment validation failed",
              errors: supervisorValidation.errors,
              warnings: supervisorValidation.warnings,
            });
          }

          // Check if there are warnings (optional - can proceed but inform user)
          if (supervisorValidation.warnings.length > 0) {
            console.log(
              "Supervisor assignment warnings:",
              supervisorValidation.warnings
            );
          }
        }
      } else {
        // For other roles, supervisor is required
        const supervisorValidation = await validateSupervisorAssignment(
          finalSupervisor,
          finalCoSupervisor,
          "change",
          req.params.id
        );

        if (!supervisorValidation.overallValid) {
          return res.status(400).json({
            message: "Supervisor assignment validation failed",
            errors: supervisorValidation.errors,
            warnings: supervisorValidation.warnings,
          });
        }
      }
    }

    if (finalCoSupervisor !== existingScholar.coSupervisor) {
      if (finalCoSupervisor) {
        // For main_office staff and drc_chair, co-supervisor is optional
        if (
          req.user?.role === "main_office" ||
          req.user?.role === "drc_chair"
        ) {
          // Allow main_office staff and drc_chair to set co-supervisors
          // But validate the co-supervisor if they do set one
          const supervisorValidation = await validateSupervisorAssignment(
            finalSupervisor,
            finalCoSupervisor,
            "change",
            req.params.id
          );

          if (!supervisorValidation.overallValid) {
            return res.status(400).json({
              message: "Supervisor assignment validation failed",
              errors: supervisorValidation.errors,
              warnings: supervisorValidation.warnings,
            });
          }
        } else {
          // For other roles, validate co-supervisor
          const supervisorValidation = await validateSupervisorAssignment(
            finalSupervisor,
            finalCoSupervisor,
            "change",
            req.params.id
          );

          if (!supervisorValidation.overallValid) {
            return res.status(400).json({
              message: "Supervisor assignment validation failed",
              errors: supervisorValidation.errors,
              warnings: supervisorValidation.warnings,
            });
          }
        }
      }
    }

    const scholar = await Scholar.findByIdAndUpdate(
      req.params.id,
      {
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
        supervisor: finalSupervisor,
        coSupervisor: finalCoSupervisor,
        departmentCode,
        isActive,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "supervisor", select: "name designation" },
      { path: "coSupervisor", select: "name designation" },
    ]);

    if (!scholar) {
      return res.status(404).json({ message: "Scholar not found" });
    }

    // Refresh faculty supervision data after successful update
    const facultyIdsToRefresh = [];
    if (finalSupervisor) facultyIdsToRefresh.push(finalSupervisor);
    if (finalCoSupervisor) facultyIdsToRefresh.push(finalCoSupervisor);
    if (existingScholar.supervisor)
      facultyIdsToRefresh.push(existingScholar.supervisor);
    if (existingScholar.coSupervisor)
      facultyIdsToRefresh.push(existingScholar.coSupervisor);

    // Remove duplicates
    const uniqueFacultyIds = [...new Set(facultyIdsToRefresh)];
    await refreshFacultySupervisionData(uniqueFacultyIds);

    // Create notifications for supervisor assignment changes
    await createSupervisorAssignmentNotifications(
      scholar,
      existingScholar.supervisor,
      finalSupervisor,
      existingScholar.coSupervisor,
      finalCoSupervisor,
      scholar.departmentCode,
      req.user._id // createdBy
    );

    res.json(scholar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Scholar (soft delete by default, permanent delete if specified)
export const deleteScholar = async (req, res) => {
  try {
    const { permanent, reactivate } = req.query;
    const scholar = await Scholar.findById(req.params.id);

    if (!scholar) {
      return res.status(404).json({ message: "Scholar not found" });
    }

    // RBAC: main_office and drc_chair can only delete scholars in their department
    if (
      (req.user?.role === "main_office" || req.user?.role === "drc_chair") &&
      scholar.departmentCode !== req.user.departmentCode
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (reactivate === "true") {
      // Reactivate scholar
      if (scholar.isActive) {
        return res.status(400).json({ message: "Scholar is already active" });
      }

      scholar.isActive = true;
      await scholar.save();

      // Refresh faculty supervision data after reactivation
      const facultyIdsToRefresh = [];
      if (scholar.supervisor) facultyIdsToRefresh.push(scholar.supervisor);
      if (scholar.coSupervisor) facultyIdsToRefresh.push(scholar.coSupervisor);
      await refreshFacultySupervisionData(facultyIdsToRefresh);

      // Create notifications for existing supervisor assignments
      if (scholar.supervisor || scholar.coSupervisor) {
        await createSupervisorAssignmentNotifications(
          scholar,
          null, // oldSupervisor
          scholar.supervisor, // newSupervisor
          null, // oldCoSupervisor
          scholar.coSupervisor, // newCoSupervisor
          scholar.departmentCode,
          req.user._id // createdBy
        );
      }

      res.json({ message: "Scholar reactivated successfully" });
    } else if (permanent === "true") {
      // Permanent delete
      await Scholar.findByIdAndDelete(req.params.id);

      // Refresh faculty supervision data after deletion
      const facultyIdsToRefresh = [];
      if (scholar.supervisor) facultyIdsToRefresh.push(scholar.supervisor);
      if (scholar.coSupervisor) facultyIdsToRefresh.push(scholar.coSupervisor);
      await refreshFacultySupervisionData(facultyIdsToRefresh);

      res.json({ message: "Scholar permanently deleted" });
    } else {
      // Soft delete (mark as inactive)
      if (!scholar.isActive) {
        return res.status(400).json({ message: "Scholar is already inactive" });
      }

      scholar.isActive = false;
      await scholar.save();

      // Refresh faculty supervision data after soft deletion
      const facultyIdsToRefresh = [];
      if (scholar.supervisor) facultyIdsToRefresh.push(scholar.supervisor);
      if (scholar.coSupervisor) facultyIdsToRefresh.push(scholar.coSupervisor);
      await refreshFacultySupervisionData(facultyIdsToRefresh);

      res.json({ message: "Scholar marked as inactive" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get scholars count for pagination
export const getScholarsCount = async (req, res) => {
  try {
    const { departmentCode, isActive } = req.query;
    let filter = {};

    if (departmentCode) filter.departmentCode = departmentCode;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    // RBAC: main_office and drc_chair only count own department
    if (req.user?.role === "main_office" || req.user?.role === "drc_chair") {
      filter.departmentCode = req.user.departmentCode;
    }

    const count = await Scholar.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create User Account for Existing Scholar
export const createUserAccountForExistingScholar = async (req, res) => {
  try {
    const { scholarId, username, password } = req.body;

    // Check if scholar exists
    const existingScholar = await Scholar.findById(scholarId);
    if (!existingScholar) {
      return res.status(404).json({ message: "Scholar not found" });
    }

    // Check if scholar already has a user account
    if (existingScholar.hasUserAccount) {
      return res
        .status(400)
        .json({ message: "Scholar already has a user account" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create user account
    const user = new User({
      name: existingScholar.name,
      email: existingScholar.email,
      username,
      password,
      role: "scholar",
      department: existingScholar.departmentCode,
      departmentCode: existingScholar.departmentCode,
      mustChangePassword: true, // Force password change on first login
    });

    const savedUser = await user.save();

    // Update scholar to mark as having user account
    await Scholar.findByIdAndUpdate(scholarId, {
      hasUserAccount: true,
      userAccountId: savedUser._id,
    });

    // Generate token for the new user
    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Send response
    res.status(201).json({
      message: "User account created successfully for existing scholar",
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
        _id: existingScholar._id,
        name: existingScholar.name,
        rollNo: existingScholar.rollNo,
        regId: existingScholar.regId,
        departmentCode: existingScholar.departmentCode,
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
    console.error("Error creating user account for existing scholar:", error);
    res
      .status(500)
      .json({ message: "Error creating user account for existing scholar" });
  }
};
