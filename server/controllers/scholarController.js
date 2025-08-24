import Scholar from "../models/Scholar.js";
import Faculty from "../models/Faculty.js";
import Department from "../models/Department.js";
import Notification from "../models/Notification.js";
import {
  validateSupervisorAssignment,
  refreshFacultySupervisionData,
} from "../utils/supervisionValidation.js";

// Helper function to create supervisor assignment notifications
const createSupervisorAssignmentNotifications = async (
  scholar,
  oldSupervisor,
  newSupervisor,
  oldCoSupervisor,
  newCoSupervisor,
  departmentCode
) => {
  try {
    const notifications = [];

    // Get faculty members to find their user account IDs
    const facultyIds = [];
    if (newSupervisor) facultyIds.push(newSupervisor);
    if (oldSupervisor) facultyIds.push(oldSupervisor);
    if (newCoSupervisor) facultyIds.push(newCoSupervisor);
    if (oldCoSupervisor) facultyIds.push(oldCoSupervisor);

    console.log(
      "Creating supervisor notifications for faculty IDs:",
      facultyIds
    );

    const faculties = await Faculty.find({ _id: { $in: facultyIds } }).populate(
      "userAccountId"
    );
    console.log(
      "Found faculties:",
      faculties.map((f) => ({
        id: f._id,
        name: f.name,
        userAccountId: f.userAccountId?._id,
      }))
    );

    const facultyMap = new Map(
      faculties.map((f) => [f._id.toString(), f.userAccountId?._id])
    );
    console.log("Faculty map:", Object.fromEntries(facultyMap));

    // Supervisor assignment notifications
    if (newSupervisor && newSupervisor !== oldSupervisor) {
      const userAccountId = facultyMap.get(newSupervisor.toString());
      if (userAccountId) {
        // Notify new supervisor
        const supervisorNotification = new Notification({
          recipient: userAccountId,
          type: "supervisor_assigned",
          title: "New Scholar Assignment",
          message: `You have been assigned as the supervisor for ${scholar.name} (${scholar.rollNo}).`,
          departmentCode,
          priority: "medium",
        });
        notifications.push(supervisorNotification.save());
      }
    }

    if (oldSupervisor && oldSupervisor !== newSupervisor) {
      const userAccountId = facultyMap.get(oldSupervisor.toString());
      if (userAccountId) {
        // Notify old supervisor about removal
        const removalNotification = new Notification({
          recipient: userAccountId,
          type: "supervisor_removed",
          title: "Scholar Assignment Removed",
          message: `Your supervision assignment for ${scholar.name} (${scholar.rollNo}) has been removed.`,
          departmentCode,
          priority: "medium",
        });
        notifications.push(removalNotification.save());
      }
    }

    // Co-supervisor assignment notifications
    if (newCoSupervisor && newCoSupervisor !== oldCoSupervisor) {
      const userAccountId = facultyMap.get(newCoSupervisor.toString());
      if (userAccountId) {
        // Notify new co-supervisor
        const coSupervisorNotification = new Notification({
          recipient: userAccountId,
          type: "co_supervisor_assigned",
          title: "New Co-Supervisor Assignment",
          message: `You have been assigned as the co-supervisor for ${scholar.name} (${scholar.rollNo}).`,
          departmentCode,
          priority: "medium",
        });
        notifications.push(coSupervisorNotification.save());
      }
    }

    if (oldCoSupervisor && oldCoSupervisor !== newCoSupervisor) {
      const userAccountId = facultyMap.get(oldCoSupervisor.toString());
      if (userAccountId) {
        // Notify old co-supervisor about removal
        const coRemovalNotification = new Notification({
          recipient: userAccountId,
          type: "co_supervisor_removed",
          title: "Co-Supervisor Assignment Removed",
          message: `Your co-supervision assignment for ${scholar.name} (${scholar.rollNo}) has been removed.`,
          departmentCode,
          priority: "medium",
        });
        notifications.push(coRemovalNotification.save());
      }
    }

    if (notifications.length > 0) {
      await Promise.all(notifications);
      console.log(
        `Created ${notifications.length} supervisor assignment notifications`
      );
      console.log(
        "Notification details:",
        notifications.map((n) => ({
          recipient: n.recipient,
          type: n.type,
          title: n.title,
        }))
      );
    } else {
      console.log("No supervisor assignment notifications created");
    }
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
        scholar.departmentCode
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
    const { departmentCode, isActive, supervisor, coSupervisor } = req.query;
    let filter = {};

    if (departmentCode) filter.departmentCode = departmentCode;
    if (isActive !== undefined && isActive !== "")
      filter.isActive = isActive === "true";

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

    console.log("Backend filter:", filter);
    console.log("User role:", req.user?.role);
    console.log("User department:", req.user?.departmentCode);
    console.log("User ID:", req.user?._id);
    console.log("Query params:", req.query);
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
      scholar.departmentCode
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
          scholar.departmentCode
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
