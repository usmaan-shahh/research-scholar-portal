import Faculty from "../models/Faculty.js";
import Department from "../models/Department.js";

const getMaxScholars = (designation) => {
  if (designation === "Professor") return 8;
  if (designation === "Associate Professor") return 6;
  if (designation === "Assistant Professor") return 4;
  return 0;
};

// Create Faculty
const createFaculty = async (req, res) => {
  try {
    const { employeeCode, name, departmentCode, designation, isPhD } = req.body;
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
    });
    res.status(201).json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Faculties (with optional filters)
const getFaculties = async (req, res) => {
  try {
    const { departmentCode, designation } = req.query;
    let filter = {};
    if (departmentCode) filter.departmentCode = departmentCode;
    if (designation) filter.designation = designation;
    const faculties = await Faculty.find(filter);
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Faculty by ID
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Faculty
const updateFaculty = async (req, res) => {
  try {
    const { employeeCode, name, departmentCode, designation, isPhD } = req.body;
    const department = await Department.findOne({ code: departmentCode });
    if (!department)
      return res.status(400).json({ message: "Invalid department code" });
    const maxScholars = getMaxScholars(designation);
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { employeeCode, name, departmentCode, designation, isPhD, maxScholars },
      { new: true, runValidators: true }
    );
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Faculty
const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
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
