import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  createMainOfficeUser,
  resetMainOfficePassword,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Redirect trailing slash to non-trailing slash
router.get("/", (req, res, next) => {
  if (req.path === "/") {
    next();
  } else {
    res.redirect(req.path.replace(/\/$/, ""));
  }
});

// All routes are protected and require admin access
router.use(protect);
router.use(authorize("admin"));

// User management routes
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Main Office User routes
router.post("/main-office", createMainOfficeUser);
router.post("/main-office/reset-password", resetMainOfficePassword);

export default router;
