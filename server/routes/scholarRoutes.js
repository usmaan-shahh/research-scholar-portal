import express from "express";
import {
  createScholar,
  getScholars,
  getScholarById,
  updateScholar,
  deleteScholar,
  getScholarsCount,
} from "../controllers/scholarController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Scholar routes
router.post("/", authorize(["admin", "main_office"]), createScholar);

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

router.get(
  "/:id",
  authorize(["admin", "main_office", "supervisor", "scholar"]),
  getScholarById
);
router.put("/:id", authorize(["admin", "main_office"]), updateScholar);
router.delete("/:id", authorize(["admin", "main_office"]), deleteScholar);

export default router;
