import express from "express";
import facultyController from "../controllers/facultyController.js";

const router = express.Router();

router.post("/", facultyController.createFaculty);
router.get("/", facultyController.getFaculties);
router.get("/:id", facultyController.getFacultyById);
router.put("/:id", facultyController.updateFaculty);
router.delete("/:id", facultyController.deleteFaculty);

export default router;
