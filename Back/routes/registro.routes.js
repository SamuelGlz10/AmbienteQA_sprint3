import { Router } from "express";
import { register } from "../controllers/login.controllers.js"; // o donde tengas la función de registro

const router = Router();

router.post("/register", register); // Ruta POST para crear cuenta

export default router;
