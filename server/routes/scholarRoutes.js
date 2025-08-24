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
router.post(
  "/",
  authorize(["admin", "main_office", "drc_chair"]),
  createScholar
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
