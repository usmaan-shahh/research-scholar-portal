import express from "express";
import multer from "multer";
import path from "path";
import {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  uploadMinutes,
  downloadMinutes,
  getMeetingStats,
} from "../controllers/drcMeetingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/minutes/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `minutes-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Apply authentication middleware to all routes
router.use(protect);

// Public routes (authenticated users can access)
router.get("/", getMeetings);
router.get("/stats", getMeetingStats);
router.get("/:id", getMeetingById);
router.get("/:id/download-minutes", downloadMinutes);

// Protected routes (drc_chair and admin only)
router.post("/", authorize(["admin", "drc_chair"]), createMeeting);
router.put("/:id", authorize(["admin", "drc_chair"]), updateMeeting);
router.delete("/:id", authorize(["admin", "drc_chair"]), deleteMeeting);
router.post(
  "/:id/upload-minutes",
  authorize(["admin", "drc_chair", "main_office"]),
  upload.single("minutes"),
  uploadMinutes
);

export default router;
