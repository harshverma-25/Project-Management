import { healthcheck } from "../controllers/healthcheck.controllers.js";
import { Router } from "express";

const router = Router();

router.get("/healthcheck", healthcheck);

export default router;