const express = require('express');
const { query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/admin/stats - system metrics
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBugs,
      openBugs,
      inProgressBugs,
      fixedBugs,
      closedBugs,
      criticalBugs,
      bugsByPriority,
      bugsByStatus,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.bug.count(),
      prisma.bug.count({ where: { status: 'OPEN' } }),
      prisma.bug.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.bug.count({ where: { status: 'FIXED' } }),
      prisma.bug.count({ where: { status: 'CLOSED' } }),
      prisma.bug.count({ where: { priority: 'CRITICAL' } }),
      prisma.bug.groupBy({ by: ['priority'], _count: { id: true } }),
      prisma.bug.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.activity.count(),
    ]);

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    res.json({
      stats: {
        users: {
          total: totalUsers,
          byRole: usersByRole.reduce((acc, item) => {
            acc[item.role] = item._count.id;
            return acc;
          }, {}),
        },
        bugs: {
          total: totalBugs,
          open: openBugs,
          inProgress: inProgressBugs,
          fixed: fixedBugs,
          closed: closedBugs,
          critical: criticalBugs,
          byPriority: bugsByPriority.reduce((acc, item) => {
            acc[item.priority] = item._count.id;
            return acc;
          }, {}),
          byStatus: bugsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
          }, {}),
        },
        totalActivities: recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/logs - activity/audit logs
router.get(
  '/logs',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('action').optional().isString(),
    query('userId').optional().isUUID(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const where = {};
      if (req.query.action) where.action = req.query.action;
      if (req.query.userId) where.userId = req.query.userId;

      const [logs, total] = await Promise.all([
        prisma.activity.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true } },
            bug: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.activity.count({ where }),
      ]);

      res.json({
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
