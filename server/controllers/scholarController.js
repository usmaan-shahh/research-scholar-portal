import Scholar from "../models/Scholar.js";
import Faculty from "../models/Faculty.js";
import Department from "../models/Department.js";

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

    // RBAC: main_office can only create within their department
    if (
      req.user?.role === "main_office" &&
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

    // For main_office staff, supervisor is optional
    let finalSupervisor = originalSupervisor;
    let finalCoSupervisor = originalCoSupervisor;

    if (req.user?.role === "main_office") {
      // Set supervisor and coSupervisor to null for main_office staff
      finalSupervisor = null;
      finalCoSupervisor = null;
    } else {
      // For other roles, supervisor is required
      if (!finalSupervisor) {
        return res.status(400).json({ message: "Supervisor is required" });
      }

      // Validate supervisor exists and belongs to the same department
      const supervisorFaculty = await Faculty.findById(finalSupervisor);
      if (!supervisorFaculty) {
        return res.status(400).json({ message: "Invalid supervisor" });
      }
      if (supervisorFaculty.departmentCode !== departmentCode) {
        return res
          .status(400)
          .json({ message: "Supervisor must be from the same department" });
      }

      // Validate co-supervisor if provided
      if (finalCoSupervisor) {
        const coSupervisorFaculty = await Faculty.findById(finalCoSupervisor);
        if (!coSupervisorFaculty) {
          return res.status(400).json({ message: "Invalid co-supervisor" });
        }
        if (coSupervisorFaculty.departmentCode !== departmentCode) {
          return res.status(400).json({
            message: "Co-supervisor must be from the same department",
          });
        }
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

    // RBAC: main_office only sees own department
    // But don't overwrite if they're explicitly querying for a different department
    if (req.user?.role === "main_office") {
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

    // RBAC: main_office can only access scholars in their department
    if (
      req.user?.role === "main_office" &&
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

    // RBAC: main_office can only update scholars in their department
    if (
      req.user?.role === "main_office" &&
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

    // Validate supervisor if changed
    let finalSupervisor = originalSupervisor;
    if (finalSupervisor && finalSupervisor !== existingScholar.supervisor) {
      // For main_office staff, supervisor is optional
      if (req.user?.role === "main_office") {
        // Set supervisor to null for main_office staff
        finalSupervisor = null;
      } else {
        const supervisorFaculty = await Faculty.findById(finalSupervisor);
        if (!supervisorFaculty) {
          return res.status(400).json({ message: "Invalid supervisor" });
        }
        const effectiveDeptCode =
          departmentCode || existingScholar.departmentCode;
        if (supervisorFaculty.departmentCode !== effectiveDeptCode) {
          return res
            .status(400)
            .json({ message: "Supervisor must be from the same department" });
        }
      }
    }

    // Validate co-supervisor if changed
    let finalCoSupervisor = originalCoSupervisor;
    if (finalCoSupervisor !== existingScholar.coSupervisor) {
      if (finalCoSupervisor) {
        // For main_office staff, co-supervisor is optional
        if (req.user?.role === "main_office") {
          // Set co-supervisor to null for main_office staff
          finalCoSupervisor = null;
        } else {
          const coSupervisorFaculty = await Faculty.findById(finalCoSupervisor);
          if (!coSupervisorFaculty) {
            return res.status(400).json({ message: "Invalid co-supervisor" });
          }
          const effectiveDeptCode =
            departmentCode || existingScholar.departmentCode;
          if (coSupervisorFaculty.departmentCode !== effectiveDeptCode) {
            return res.status(400).json({
              message: "Co-supervisor must be from the same department",
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

    // RBAC: main_office can only delete scholars in their department
    if (
      req.user?.role === "main_office" &&
      scholar.departmentCode !== req.user.departmentCode
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (permanent === "true") {
      // Permanent delete
      await Scholar.findByIdAndDelete(req.params.id);
      res.json({ message: "Scholar permanently deleted" });
    } else {
      // Soft delete (mark as inactive)
      scholar.isActive = false;
      await scholar.save();
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

    // RBAC: main_office only counts own department
    if (req.user?.role === "main_office") {
      filter.departmentCode = req.user.departmentCode;
    }

    const count = await Scholar.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
