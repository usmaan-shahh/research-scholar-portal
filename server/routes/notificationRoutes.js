import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("🔔 Setting up notification routes...");

// Test route to verify routing is working
router.get("/test", (req, res) => {
  console.log("🔔 Test route hit!");
  res.json({ message: "Notification routes are working!" });
});

// All routes require authentication
router.use(protect);

// Get user's notifications
router.get(
  "/",
  (req, res, next) => {
    console.log("🔔 GET /api/notifications/ - getUserNotifications");
    next();
  },
  notificationController.getUserNotifications
);

// Get notification stats
router.get(
  "/stats",
  (req, res, next) => {
    console.log("🔔 GET /api/notifications/stats - getNotificationStats");
    next();
  },
  notificationController.getNotificationStats
);

// Mark notification as read
router.patch("/:id/read", notificationController.markNotificationAsRead);

// Mark all notifications as read
router.patch(
  "/mark-all-read",
  notificationController.markAllNotificationsAsRead
);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

// Create notification (admin/main_office/drc_chair only)
router.post(
  "/",
  authorize(["admin", "main_office", "drc_chair"]),
  notificationController.createNotification
);

export default router;
