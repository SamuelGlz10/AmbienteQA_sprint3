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

export default router;
