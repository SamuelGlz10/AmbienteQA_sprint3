import { Router } from "express";
import {
  getProjects,
  getProject,
  postProject,
  putProject,
  deleteProject,
  updateRequirements,
} from "../controllers/projectsFB.controllers.js";

const router = Router();

router.get("/projectsFB/", getProjects);
router.get("/projectsFB/:id", getProject);
router.post("/projectsFB/", postProject);
router.put("/projectsFB/:id", putProject);
router.delete("/projectsFB/:id", deleteProject);
router.put("/projectsFB/updateRequirements", updateRequirements); // Ruta para actualizar requerimientos

export default router;