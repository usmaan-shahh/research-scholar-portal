import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
// router.put("/update-role", protect, authorize("admin"), updateUserRole);

export default router;
 