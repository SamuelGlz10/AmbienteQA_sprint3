import { Router } from "express";
import { generateEpic } from "../controllers/ai.controllers.js";

const router = Router();

router.post("/generateEpic", generateEpic);

export default router;