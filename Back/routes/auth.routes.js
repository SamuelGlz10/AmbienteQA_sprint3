import { Router } from "express";
import { login, registro, exchangeWhoopToken, refreshWhoopToken } from "../controllers/auth.controllers.js";

const router = Router();

router.post("/login", login);

router.post("/registro", registro);

router.post('/whoop/token', exchangeWhoopToken);

router.post('/whoop/refresh', refreshWhoopToken);

export default router;
