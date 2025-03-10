import { Router } from "express";
import { getIndex, getPing } from "../controllers/index.controllers.js";

const router = Router();

// Definimos una ruta para el método GET
//     [  ruta  ]                   [           controlador          ]
router.get("/", getIndex);
router.get("/ping", getPing);

export default router;
