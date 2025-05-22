import { Router } from "express";
import { handleWebhook } from "../controllers/dialogflow.controllers.js";

const router = Router();

// Endpoint para manejar el webhook de Dialogflow
router.post("/dialogflow/webhook", handleWebhook);

export default router;
