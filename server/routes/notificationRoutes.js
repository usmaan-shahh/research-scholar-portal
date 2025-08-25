import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("🔔 Setting up CS department notification routes...");

// Debug middleware for notification routes
router.use((req, res, next) => {
  console.log(`🔔 Notification Route: ${req.method} ${req.path}`);
  console.log(`🔔 User:`, req.user?._id);
  next();
});

// All routes require authentication
router.use(protect);

// Get user's notifications
router.get("/", notificationController.getUserNotifications);

// Get notification stats
router.get("/stats", notificationController.getNotificationStats);

// Mark notification as read
router.patch("/:id/read", notificationController.markNotificationAsRead);

// Mark all notifications as read
router.patch(
  "/mark-all-read",
  notificationController.markAllNotificationsAsRead
);

export default router;
