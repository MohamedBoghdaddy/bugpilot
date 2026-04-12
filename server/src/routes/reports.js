import express from "express";
import { query, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import authenticate from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/reports/bugs-by-priority - aggregated counts by priority
router.get('/bugs-by-priority', async (req, res, next) => {
  try {
    const result = await prisma.bug.groupBy({
      by: ['priority'],
      _count: { id: true },
    });

    const data = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    result.forEach((item) => {
      data[item.priority] = item._count.id;
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/bugs-by-status - aggregated counts by status
router.get('/bugs-by-status', async (req, res, next) => {
  try {
    const result = await prisma.bug.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const data = { OPEN: 0, ASSIGNED: 0, IN_PROGRESS: 0, FIXED: 0, CLOSED: 0, VERIFIED: 0 };
    result.forEach((item) => {
      data[item.status] = item._count.id;
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/velocity - bugs resolved over time (last 30 days by default)
router.get(
  '/velocity',
  [query('days').optional().isInt({ min: 1, max: 365 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const days = parseInt(req.query.days) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const resolved = await prisma.activity.findMany({
        where: {
          action: 'STATUS_CHANGED',
          details: { contains: 'FIXED' },
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      // Group by date
      const velocityMap = {};
      resolved.forEach((item) => {
        const dateKey = item.createdAt.toISOString().split('T')[0];
        velocityMap[dateKey] = (velocityMap[dateKey] || 0) + 1;
      });

      // Fill in missing dates with 0
      const velocity = [];
      const current = new Date(startDate);
      const today = new Date();
      while (current <= today) {
        const dateKey = current.toISOString().split('T')[0];
        velocity.push({
          date: dateKey,
          resolved: velocityMap[dateKey] || 0,
        });
        current.setDate(current.getDate() + 1);
      }

      res.json({ velocity, totalResolved: resolved.length, days });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
