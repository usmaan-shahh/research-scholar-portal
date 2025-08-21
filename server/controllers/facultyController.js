import Faculty from "../models/Faculty.js";
import Department from "../models/Department.js";

const getMaxScholars = (designation) => {
  if (designation === "Professor") return 8;
  if (designation === "Associate Professor") return 6;
  if (designation === "Assistant Professor") return 4;
  return 0;
};

// Helper function to compute supervision eligibility
const computeSupervisionEligibility = (faculty) => {
  // Must have PhD to be eligible
  if (!faculty.isPhD) {
    return {
      isEligible: false,
      reason: "PhD required for supervision",
    };
  }

  // Check publication requirements based on designation
  switch (faculty.designation) {
    case "Professor":
    case "Associate Professor":
      const isEligible = faculty.numberOfPublications > 5;
      return {
        isEligible,
        reason: isEligible
          ? "Eligible for supervision"
          : `Requires more than 5 publications (current: ${faculty.numberOfPublications})`,
      };
    case "Assistant Professor":
      const isEligibleAsst = faculty.numberOfPublications > 3;
      return {
        isEligible: isEligibleAsst,
        reason: isEligibleAsst
          ? "Eligible for supervision"
          : `Requires more than 3 publications (current: ${faculty.numberOfPublications})`,
      };
    default:
      return {
        isEligible: false,
        reason: "Invalid designation",
      };
  }
};

// Create Faculty
const createFaculty = async (req, res) => {
  try {
    const {
      employeeCode,
      name,
      departmentCode,
      designation,
      isPhD,
      numberOfPublications = 0,
      isActive = true,
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

    const existing = await Faculty.findOne({ employeeCode });
    if (existing)
      return res.status(400).json({ message: "Employee code already exists" });
    const department = await Department.findOne({ code: departmentCode });
    if (!department)
      return res.status(400).json({ message: "Invalid department code" });
    const maxScholars = getMaxScholars(designation);
    const faculty = await Faculty.create({
      employeeCode,
      name,
      departmentCode,
      designation,
      isPhD,
      maxScholars,
      numberOfPublications,
      isActive,
    });

    // Add computed fields to response
    const facultyObj = faculty.toObject();
    const eligibility = computeSupervisionEligibility(faculty);
    const response = {
      ...facultyObj,
      isEligibleForSupervision: eligibility.isEligible,
      eligibilityReason: eligibility.reason,
    };

    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Faculties (with optional filters)
const getFaculties = async (req, res) => {
  try {
    const { departmentCode, designation, supervisionEligibility } = req.query;
    let filter = {};
    if (departmentCode) filter.departmentCode = departmentCode;
    if (designation) filter.designation = designation;

    // RBAC: main_office only sees own department
    if (req.user?.role === "main_office") {
      filter.departmentCode = req.user.departmentCode;
    }

    let faculties = await Faculty.find(filter);

    // Apply supervision eligibility filter if specified
    if (supervisionEligibility) {
      faculties = faculties.filter((faculty) => {
        const eligibility = computeSupervisionEligibility(faculty);
        if (supervisionEligibility === "eligible") {
          return eligibility.isEligible;
        } else if (supervisionEligibility === "not-eligible") {
          return !eligibility.isEligible;
        }
        return true;
      });
    }

    // Add computed fields to each faculty
    const facultiesWithEligibility = faculties.map((faculty) => {
      const facultyObj = faculty.toObject();
      const eligibility = computeSupervisionEligibility(faculty);
      return {
        ...facultyObj,
        isEligibleForSupervision: eligibility.isEligible,
        eligibilityReason: eligibility.reason,
      };
    });

    res.json(facultiesWithEligibility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Faculty by ID
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    if (
      req.user?.role === "main_office" &&
      faculty.departmentCode !== req.user.departmentCode
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Add computed fields to response
    const facultyObj = faculty.toObject();
    const eligibility = computeSupervisionEligibility(faculty);
    const response = {
      ...facultyObj,
      isEligibleForSupervision: eligibility.isEligible,
      eligibilityReason: eligibility.reason,
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Faculty
const updateFaculty = async (req, res) => {
  try {
    const {
      employeeCode,
      name,
      departmentCode,
      designation,
      isPhD,
      numberOfPublications = 0,
      isActive = true,
    } = req.body;

    const existingFaculty = await Faculty.findById(req.params.id);
    if (!existingFaculty)
      return res.status(404).json({ message: "Faculty not found" });

    // RBAC: main_office can only update within their department
    if (
      req.user?.role === "main_office" &&
      existingFaculty.departmentCode !== req.user.departmentCode
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const department = await Department.findOne({ code: departmentCode });
    if (!department)
      return res.status(400).json({ message: "Invalid department code" });
    const maxScholars = getMaxScholars(designation);
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      {
        employeeCode,
        name,
        departmentCode,
        designation,
        isPhD,
        maxScholars,
        numberOfPublications,
        isActive,
      },
      { new: true, runValidators: true }
    );
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    // Add computed fields to response
    const facultyObj = faculty.toObject();
    const eligibility = computeSupervisionEligibility(faculty);
    const response = {
      ...facultyObj,
      isEligibleForSupervision: eligibility.isEligible,
      eligibilityReason: eligibility.reason,
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Faculty
const deleteFaculty = async (req, res) => {
  try {
    const existingFaculty = await Faculty.findById(req.params.id);
    if (!existingFaculty)
      return res.status(404).json({ message: "Faculty not found" });

    if (
      req.user?.role === "main_office" &&
      existingFaculty.departmentCode !== req.user.departmentCode
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await existingFaculty.deleteOne();
    res.json({ message: "Faculty deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};
