import Faculty from "../models/Faculty.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import crypto from "crypto";

const getMaxScholars = (designation) => {
  if (designation === "Professor") return 8;
  if (designation === "Associate Professor") return 6;
  if (designation === "Assistant Professor") return 4;
  return 0;
};

// Helper function to generate temporary password
const generateTempPassword = () =>
  crypto
    .randomBytes(9)
    .toString("base64")
    .replace(/[^A-Za-z0-9]/g, "A")
    .slice(0, 12);

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
      createUserAccount = false,
      username,
      tempPassword,
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

    // Create faculty record
    const facultyData = {
      employeeCode,
      name,
      departmentCode,
      designation,
      isPhD,
      maxScholars,
      numberOfPublications,
      isActive,
    };

    // If creating user account, validate required fields
    if (createUserAccount) {
      if (!username) {
        return res
          .status(400)
          .json({ message: "Username is required for account creation" });
      }

      // Check if username already exists in User collection
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          message: "User with this username already exists",
        });
      }

      // Check if username already exists in Faculty collection
      const existingFacultyWithAccount = await Faculty.findOne({ username });
      if (existingFacultyWithAccount) {
        return res.status(400).json({
          message: "Faculty with this username already exists",
        });
      }

      facultyData.username = username;
      facultyData.hasUserAccount = true;
    }

    const faculty = await Faculty.create(facultyData);

    // Create user account if requested
    let userAccount = null;
    if (createUserAccount) {
      const password = tempPassword || generateTempPassword();

      userAccount = await User.create({
        name,
        email: `${username}@university.edu`, // Generate email from username
        username,
        password,
        role: "supervisor",
        department: department.name,
        departmentCode,
        isActive: true,
        mustChangePassword: true,
      });

      // Update faculty with user account reference
      faculty.userAccountId = userAccount._id;
      await faculty.save();
    }

    // Add computed fields to response
    const facultyObj = faculty.toObject();
    const eligibility = computeSupervisionEligibility(faculty);
    const response = {
      ...facultyObj,
      isEligibleForSupervision: eligibility.isEligible,
      eligibilityReason: eligibility.reason,
    };

    // Include account creation details in response
    if (createUserAccount && userAccount) {
      response.userAccount = {
        id: userAccount._id,
        username: userAccount.username,
        email: userAccount.email,
        role: userAccount.role,
        mustChangePassword: userAccount.mustChangePassword,
        tempPassword: tempPassword ? undefined : password,
      };
    }

    res.status(201).json(response);
  } catch (err) {
    console.error("createFaculty error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Create Faculty Account (separate function for account creation)
export const createFacultyAccount = async (req, res) => {
  try {
    const { facultyId, username, tempPassword } = req.body;

    if (!facultyId || !username) {
      return res.status(400).json({
        message: "Faculty ID and username are required",
      });
    }

    // Find the faculty member
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // RBAC: main_office can only create accounts within their department
    if (
      req.user?.role === "main_office" &&
      req.user.departmentCode !== faculty.departmentCode
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: department mismatch" });
    }

    // Check if faculty already has a user account
    if (faculty.hasUserAccount) {
      return res.status(400).json({
        message: "Faculty already has a user account",
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this username already exists",
      });
    }

    const existingFacultyWithAccount = await Faculty.findOne({ username });
    if (existingFacultyWithAccount) {
      return res.status(400).json({
        message: "Faculty with this username already exists",
      });
    }

    // Create user account
    const password = tempPassword || generateTempPassword();
    const userAccount = await User.create({
      name: faculty.name,
      email: `${username}@university.edu`, // Generate email from username
      username,
      password,
      role: "supervisor",
      department: faculty.departmentCode, // Will be populated with department name
      departmentCode: faculty.departmentCode,
      isActive: true,
      mustChangePassword: true,
    });

    // Update faculty with user account details
    faculty.username = username;
    faculty.hasUserAccount = true;
    faculty.userAccountId = userAccount._id;
    await faculty.save();

    res.json({
      message: "Faculty account created successfully",
      faculty: {
        id: faculty._id,
        name: faculty.name,
        employeeCode: faculty.employeeCode,
        username: faculty.username,
        hasUserAccount: faculty.hasUserAccount,
      },
      userAccount: {
        id: userAccount._id,
        username: userAccount.username,
        email: userAccount.email,
        role: userAccount.role,
        mustChangePassword: userAccount.mustChangePassword,
        tempPassword: tempPassword ? undefined : password,
      },
    });
  } catch (err) {
    console.error("createFacultyAccount error:", err);
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

    let faculties = await Faculty.find(filter).populate(
      "userAccountId",
      "name email role"
    );

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
        userId: faculty.userAccountId?._id, // Add userId for backward compatibility
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
    const faculty = await Faculty.findById(req.params.id).populate(
      "userAccountId",
      "name email role"
    );
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
      userId: faculty.userAccountId?._id, // Add userId for backward compatibility
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
    ).populate("userAccountId", "name email role");
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    // Add computed fields to response
    const facultyObj = faculty.toObject();
    const eligibility = computeSupervisionEligibility(faculty);
    const response = {
      ...facultyObj,
      isEligibleForSupervision: eligibility.isEligible,
      eligibilityReason: eligibility.reason,
      userId: faculty.userAccountId?._id, // Add userId for backward compatibility
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
  createFacultyAccount,
};
