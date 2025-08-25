import express from "express";
import {
  register,
  login,
  logout,
  changePassword,
  createScholarAccount,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/change-password", protect, changePassword);
router.post(
  "/create-scholar-account",
  protect,
  authorize(["main_office", "admin"]),
  createScholarAccount
);

export default router;
