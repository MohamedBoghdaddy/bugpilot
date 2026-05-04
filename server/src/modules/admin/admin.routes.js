import express from "express";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/rbac.js";
import { getStats, getLogs } from "./admin.controller.js";

const router = express.Router();
router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/stats", getStats);
router.get("/logs", getLogs);

export default router;
