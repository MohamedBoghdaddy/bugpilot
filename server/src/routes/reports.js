import express from "express";
import authenticate from "../middleware/auth.js";
import { bugsByPriority, bugsByStatus, velocity } from "../controllers/reportController.js";

const router = express.Router();
router.use(authenticate);

router.get("/bugs-by-priority", bugsByPriority);
router.get("/bugs-by-status", bugsByStatus);
router.get("/velocity", velocity);

export default router;
