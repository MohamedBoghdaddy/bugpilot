const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

const router = express.Router();
const prisma = new PrismaClient();

// All bug routes require authentication
router.use(authenticate);

// GET /api/bugs - list bugs with filters
router.get(
  '/',
  [
    query('status').optional().isIn(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'FIXED', 'CLOSED', 'VERIFIED']),
    query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    query('severity').optional().isIn(['MINOR', 'MAJOR', 'CRITICAL', 'BLOCKER']),
    query('assignee').optional().isUUID(),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, priority, severity, assignee, search } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (severity) where.severity = severity;
      if (assignee) where.assigneeId = assignee;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [bugs, total] = await Promise.all([
        prisma.bug.findMany({
          where,
          include: {
            reporter: { select: { id: true, name: true, email: true, avatar: true } },
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.bug.count({ where }),
      ]);

      res.json({
        bugs,
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

// GET /api/bugs/my - bugs reported by current user
router.get('/my', async (req, res, next) => {
  try {
    const bugs = await prisma.bug.findMany({
      where: { reporterId: req.user.id },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bugs });
  } catch (err) {
    next(err);
  }
});

// GET /api/bugs/assigned - bugs assigned to current user
router.get('/assigned', async (req, res, next) => {
  try {
    const bugs = await prisma.bug.findMany({
      where: { assigneeId: req.user.id },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bugs });
  } catch (err) {
    next(err);
  }
});

// GET /api/bugs/:id - bug details
router.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bug = await prisma.bug.findUnique({
      where: { id: req.params.id },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          include: {
            uploader: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found.' });
    }

    res.json({ bug });
  } catch (err) {
    next(err);
  }
});

// POST /api/bugs - create bug
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('stepsToReproduce').optional().trim(),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    body('severity').optional().isIn(['MINOR', 'MAJOR', 'CRITICAL', 'BLOCKER']),
    body('assigneeId').optional().isUUID(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, stepsToReproduce, priority, severity, assigneeId } = req.body;

      const bug = await prisma.bug.create({
        data: {
          title,
          description,
          stepsToReproduce,
          priority: priority || 'MEDIUM',
          severity: severity || 'MAJOR',
          reporterId: req.user.id,
          assigneeId: assigneeId || null,
          status: assigneeId ? 'ASSIGNED' : 'OPEN',
        },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatar: true } },
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });

      await prisma.activity.create({
        data: {
          action: 'BUG_CREATED',
          details: `Bug "${title}" created with ${priority || 'MEDIUM'} priority`,
          bugId: bug.id,
          userId: req.user.id,
        },
      });

      res.status(201).json({ bug });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/bugs/:id - update bug
router.patch(
  '/:id',
  [
    param('id').isUUID(),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('stepsToReproduce').optional().trim(),
    body('status').optional().isIn(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'FIXED', 'CLOSED', 'VERIFIED']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    body('severity').optional().isIn(['MINOR', 'MAJOR', 'CRITICAL', 'BLOCKER']),
    body('assigneeId').optional(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await prisma.bug.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Bug not found.' });
      }

      const { title, description, stepsToReproduce, status, priority, severity, assigneeId } = req.body;

      const data = {};
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (stepsToReproduce !== undefined) data.stepsToReproduce = stepsToReproduce;
      if (status !== undefined) data.status = status;
      if (priority !== undefined) data.priority = priority;
      if (severity !== undefined) data.severity = severity;
      if (assigneeId !== undefined) data.assigneeId = assigneeId || null;

      const bug = await prisma.bug.update({
        where: { id: req.params.id },
        data,
        include: {
          reporter: { select: { id: true, name: true, email: true, avatar: true } },
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });

      const changes = [];
      if (status && status !== existing.status) changes.push(`status: ${existing.status} -> ${status}`);
      if (priority && priority !== existing.priority) changes.push(`priority: ${existing.priority} -> ${priority}`);
      if (assigneeId !== undefined && assigneeId !== existing.assigneeId) changes.push('assignee changed');

      await prisma.activity.create({
        data: {
          action: 'BUG_UPDATED',
          details: changes.length > 0 ? changes.join(', ') : 'Bug details updated',
          bugId: bug.id,
          userId: req.user.id,
        },
      });

      res.json({ bug });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/bugs/:id/assign - assign bug
router.patch(
  '/:id/assign',
  [
    param('id').isUUID(),
    body('assigneeId').isUUID().withMessage('Valid assignee ID is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await prisma.bug.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Bug not found.' });
      }

      const assignee = await prisma.user.findUnique({ where: { id: req.body.assigneeId } });
      if (!assignee) {
        return res.status(404).json({ error: 'Assignee not found.' });
      }

      const bug = await prisma.bug.update({
        where: { id: req.params.id },
        data: {
          assigneeId: req.body.assigneeId,
          status: existing.status === 'OPEN' ? 'ASSIGNED' : existing.status,
        },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatar: true } },
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });

      await prisma.activity.create({
        data: {
          action: 'BUG_ASSIGNED',
          details: `Bug assigned to ${assignee.name}`,
          bugId: bug.id,
          userId: req.user.id,
        },
      });

      res.json({ bug });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/bugs/:id/status - update status
router.patch(
  '/:id/status',
  [
    param('id').isUUID(),
    body('status')
      .isIn(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'FIXED', 'CLOSED', 'VERIFIED'])
      .withMessage('Valid status is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await prisma.bug.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Bug not found.' });
      }

      const bug = await prisma.bug.update({
        where: { id: req.params.id },
        data: { status: req.body.status },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatar: true } },
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });

      await prisma.activity.create({
        data: {
          action: 'STATUS_CHANGED',
          details: `Status changed from ${existing.status} to ${req.body.status}`,
          bugId: bug.id,
          userId: req.user.id,
        },
      });

      res.json({ bug });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/bugs/:id/priority - update priority
router.patch(
  '/:id/priority',
  [
    param('id').isUUID(),
    body('priority')
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      .withMessage('Valid priority is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await prisma.bug.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Bug not found.' });
      }

      const bug = await prisma.bug.update({
        where: { id: req.params.id },
        data: { priority: req.body.priority },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatar: true } },
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });

      await prisma.activity.create({
        data: {
          action: 'PRIORITY_CHANGED',
          details: `Priority changed from ${existing.priority} to ${req.body.priority}`,
          bugId: bug.id,
          userId: req.user.id,
        },
      });

      res.json({ bug });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/bugs/:id - delete bug (admin only)
router.delete(
  '/:id',
  authorize('ADMIN'),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await prisma.bug.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Bug not found.' });
      }

      await prisma.bug.delete({ where: { id: req.params.id } });

      await prisma.activity.create({
        data: {
          action: 'BUG_DELETED',
          details: `Bug "${existing.title}" deleted`,
          userId: req.user.id,
        },
      });

      res.json({ message: 'Bug deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
