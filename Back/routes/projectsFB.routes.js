import { Router } from "express";
import multer from "multer";
import { verifyToken } from "../utils/auth.middleware.js";

import {
  getProjects,
  getProject,
  postProject,
  putProject,
  deleteProject,
  updateRequirements,
  uploadProjectImage,
  linkUserToProject,
  unlinkUserFromProject,
  getProjectTeamMembers,
  updateTasks,
  getAllTasks,
  getTasks,
  getProjectAndTitle,
} from "../controllers/projectsFB.controllers.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Configuración de multer para almacenar archivos en memoria

router.get("/projectsFB/", verifyToken, getProjects);
router.get("/projectsFB/:id", verifyToken, getProject);
router.post("/projectsFB/", verifyToken, postProject);
router.put("/projectsFB/:id", verifyToken, putProject);
router.delete("/projectsFB/:id", verifyToken, deleteProject);
router.put("/projectsFB/updateRequirements", verifyToken, updateRequirements); // Ruta para actualizar requerimientos
router.post(
  "/projectsFB/uploadImage",
  verifyToken,
  upload.single("image"),
  uploadProjectImage
); // Ruta para subir imagen del proyecto
router.post("/projectsFB/linkUserToProject", verifyToken, linkUserToProject); // Ruta para vincular usuario a proyecto
router.post(
  "/projectsFB/unlinkUserFromProject",
  verifyToken,
  unlinkUserFromProject
); // Ruta para desvincular usuario de proyecto
router.get("/projectsFB/:projectId/team", verifyToken, getProjectTeamMembers); // Ruta para obtener miembros del equipo de un proyecto
router.get("/projectsFB/:id/all-tasks", verifyToken, getAllTasks);
router.get("/projectsFB/:id/tasks", verifyToken, getTasks);
router.post("/projectsFB/:id/tasks", verifyToken, updateTasks);
router.put("/projectsFB/:id/tasks", verifyToken, updateTasks);

router.get("/projectsFB/:id/projectAndTitle", verifyToken, getProjectAndTitle); // Ruta para obtener el proyecto y titulo de usuario


export default router;
