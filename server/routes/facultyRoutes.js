import express from "express";
import facultyController from "../controllers/facultyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getFacultyWithSupervisionLoad } from "../utils/supervisionValidation.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get faculty with supervision load (for supervisor assignment)
router.get(
  "/supervision-load",
  authorize(["admin", "main_office", "drc_chair"]),
  async (req, res) => {
    try {
      const { departmentCode } = req.query;
      const faculty = await getFacultyWithSupervisionLoad(departmentCode);
      res.json(faculty);
    } catch (error) {
      console.error("Error getting faculty with supervision load:", error);
      res
        .status(500)
        .json({ message: "Error fetching faculty supervision load" });
    }
  }
);

// Create faculty account (for existing faculty members)
router.post(
  "/create-account",
  authorize(["admin", "main_office"]),
  facultyController.createFacultyAccount
);

// Existing routes (keep them as is for now)
router.post("/", facultyController.createFaculty);
router.get("/", facultyController.getFaculties);
router.get("/:id", facultyController.getFacultyById);
router.put("/:id", facultyController.updateFaculty);
router.delete("/:id", facultyController.deleteFaculty);

export default router;
