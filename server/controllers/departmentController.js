import Department from "../models/Department.js";

// Create Department
const createDepartment = async (req, res) => {
  try {
    const { code, name, address, block } = req.body;
    const existing = await Department.findOne({ code });
    if (existing)
      return res
        .status(400)
        .json({ message: "Department code already exists" });
    const department = await Department.create({ code, name, address, block });
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Department by ID
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department)
      return res.status(404).json({ message: "Department not found" });
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Department
const updateDepartment = async (req, res) => {
  try {
    const { code, name, address, block } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { code, name, address, block },
      { new: true, runValidators: true }
    );
    if (!department)
      return res.status(404).json({ message: "Department not found" });
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Department
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department)
      return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
