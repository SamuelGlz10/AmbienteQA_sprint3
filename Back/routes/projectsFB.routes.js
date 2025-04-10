import { Router } from "express";
import multer from "multer";
import {
  getProjects,
  getProject,
  postProject,
  putProject,
  deleteProject,
  updateRequirements,
  uploadProjectImage
} from "../controllers/projectsFB.controllers.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Configuración de multer para almacenar archivos en memoria

router.get("/projectsFB/", getProjects);
router.get("/projectsFB/:id", getProject);
router.post("/projectsFB/", postProject);
router.put("/projectsFB/:id", putProject);
router.delete("/projectsFB/:id", deleteProject);
router.put("/projectsFB/updateRequirements", updateRequirements); // Ruta para actualizar requerimientos
router.post("/projectsFB/uploadImage", upload.single("image"), uploadProjectImage); // Ruta para subir imagen del proyecto

export default router;