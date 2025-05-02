import { Router } from "express";
import { login, registro } from "../controllers/auth.controllers.js";

const router = Router();

router.post("login", login);

router.post("/registro", registro);

export default router;
