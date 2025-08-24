import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  createMainOfficeUser,
  resetMainOfficePassword,
  createDRCChairUser,
  resetDRCChairPassword,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  if (req.path === "/") {
    next();
  } else {
    res.redirect(req.path.replace(/\/$/, ""));
  }
});

router.use(protect);
router.use(authorize("admin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/main-office", createMainOfficeUser);
router.post("/main-office/reset-password", resetMainOfficePassword);

router.post("/drc-chair", createDRCChairUser);
router.post("/drc-chair/reset-password", resetDRCChairPassword);

export default router;
