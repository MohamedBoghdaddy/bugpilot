import express from "express";
import authenticate from "../../middlewares/authMiddleware.js";
import { bugsByPriority, bugsByStatus, velocity } from "./report.controller.js";

const router = express.Router();
router.use(authenticate);

router.get("/bugs-by-priority", bugsByPriority);
router.get("/bugs-by-status", bugsByStatus);
router.get("/velocity", velocity);

export default router;
