import express from "express";
import authenticate from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";
import { getStats, getLogs } from "../controllers/adminController.js";

const router = express.Router();
router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/stats", getStats);
router.get("/logs", getLogs);

export default router;
