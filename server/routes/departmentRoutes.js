import express from "express";
import departmentController from "../controllers/departmentController.js";

const router = express.Router();

router.post("/", departmentController.createDepartment);
router.get("/", departmentController.getDepartments);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

export default router;
