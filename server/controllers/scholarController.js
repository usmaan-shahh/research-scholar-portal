import Scholar from "../models/Scholar.js";
import Faculty from "../models/Faculty.js";
import Department from "../models/Department.js";
import {
  validateSupervisorAssignment,
  refreshFacultySupervisionData,
} from "../utils/supervisionValidation.js";

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
    const { departmentCode, isActive, supervisor } = req.query;
    let filter = {};

    if (departmentCode) filter.departmentCode = departmentCode;
    if (isActive !== undefined && isActive !== "")
      filter.isActive = isActive === "true";
    if (supervisor && supervisor !== "") filter.supervisor = supervisor;

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

    console.log("Backend filter:", filter);
    console.log("User role:", req.user?.role);
    console.log("User department:", req.user?.departmentCode);

    const scholars = await Scholar.find(filter)
      .populate("supervisor", "name designation")
      .populate("coSupervisor", "name designation")
      .sort({ createdAt: -1 });

    console.log("Found scholars count:", scholars.length);
    console.log(
      "Scholar departments:",
      scholars.map((s) => ({ id: s._id, dept: s.departmentCode }))
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

    res.json(scholar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Scholar (soft delete by default, permanent delete if specified)
export const deleteScholar = async (req, res) => {
  try {
    const { permanent } = req.query;
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

    if (permanent === "true") {
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
