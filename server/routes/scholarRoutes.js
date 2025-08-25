import express from "express";
import Scholar from "../models/Scholar.js";
import {
  createScholar,
  getScholars,
  getScholarById,
  updateScholar,
  deleteScholar,
  getScholarsCount,
  createUserAccountForExistingScholar,
} from "../controllers/scholarController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Scholar routes
router.post(
  "/",
  authorize(["admin", "main_office", "drc_chair"]),
  createScholar
);

router.post(
  "/create-user-account",
  authorize(["admin", "main_office", "drc_chair"]),
  createUserAccountForExistingScholar
);

router.get(
  "/",
  authorize(["admin", "main_office", "supervisor", "scholar", "drc_chair"]),
  getScholars
);

router.get(
  "/count",
  authorize(["admin", "main_office", "drc_chair"]),
  getScholarsCount
);

// Debug endpoint to check all scholars (temporary)
router.get(
  "/debug/all",
  authorize(["admin", "main_office", "drc_chair"]),
  async (req, res) => {
    try {
      const scholars = await Scholar.find({})
        .populate("supervisor", "name designation")
        .populate("coSupervisor", "name designation");

      res.json({
        total: scholars.length,
        scholars: scholars.map((s) => ({
          id: s._id,
          name: s.name,
          supervisor: s.supervisor?._id || s.supervisor,
          coSupervisor: s.coSupervisor?._id || s.coSupervisor,
          department: s.departmentCode,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/:id",
  authorize(["admin", "main_office", "supervisor", "scholar", "drc_chair"]),
  getScholarById
);
router.put(
  "/:id",
  authorize(["admin", "main_office", "drc_chair"]),
  updateScholar
);
router.delete(
  "/:id",
  authorize(["admin", "main_office", "drc_chair"]),
  deleteScholar
);

export default router;
