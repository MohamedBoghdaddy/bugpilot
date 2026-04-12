import express from "express";
import { body, param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import authenticate from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/tasks/my - tasks for current user
router.get('/my', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: req.user.id },
      include: {
        bug: { select: { id: true, title: true, status: true, priority: true } },
        story: { select: { id: true, title: true, status: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks - list all tasks
router.get('/', async (req, res, next) => {
  try {
    const { status, assigneeId, storyId, bugId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (storyId) where.storyId = storyId;
    if (bugId) where.bugId = bugId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        bug: { select: { id: true, title: true, status: true } },
        story: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id - get task details
router.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        bug: { select: { id: true, title: true, status: true, priority: true } },
        story: { select: { id: true, title: true, status: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks - create task
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('status').optional().isString(),
    body('assigneeId').optional().isUUID(),
    body('bugId').optional().isUUID(),
    body('storyId').optional().isUUID(),
    body('dueDate').optional().isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, status, assigneeId, bugId, storyId, dueDate } = req.body;

      // Validate references if provided
      if (bugId) {
        const bug = await prisma.bug.findUnique({ where: { id: bugId } });
        if (!bug) return res.status(404).json({ error: 'Referenced bug not found.' });
      }
      if (storyId) {
        const story = await prisma.story.findUnique({ where: { id: storyId } });
        if (!story) return res.status(404).json({ error: 'Referenced story not found.' });
      }
      if (assigneeId) {
        const user = await prisma.user.findUnique({ where: { id: assigneeId } });
        if (!user) return res.status(404).json({ error: 'Assignee not found.' });
      }

      const task = await prisma.task.create({
        data: {
          title,
          status: status || 'TODO',
          assigneeId: assigneeId || null,
          bugId: bugId || null,
          storyId: storyId || null,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
          bug: { select: { id: true, title: true } },
          story: { select: { id: true, title: true } },
        },
      });

      await prisma.activity.create({
        data: {
          action: 'TASK_CREATED',
          details: `Task "${title}" created`,
          bugId: bugId || null,
          userId: req.user.id,
        },
      });

      res.status(201).json({ task });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/tasks/:id - update task
router.patch(
  '/:id',
  [
    param('id').isUUID(),
    body('title').optional().trim().notEmpty(),
    body('status').optional().isString(),
    body('assigneeId').optional(),
    body('bugId').optional(),
    body('storyId').optional(),
    body('dueDate').optional(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Task not found.' });
      }

      const data = {};
      if (req.body.title !== undefined) data.title = req.body.title;
      if (req.body.status !== undefined) data.status = req.body.status;
      if (req.body.assigneeId !== undefined) data.assigneeId = req.body.assigneeId || null;
      if (req.body.bugId !== undefined) data.bugId = req.body.bugId || null;
      if (req.body.storyId !== undefined) data.storyId = req.body.storyId || null;
      if (req.body.dueDate !== undefined) {
        data.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
      }

      const task = await prisma.task.update({
        where: { id: req.params.id },
        data,
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
          bug: { select: { id: true, title: true } },
          story: { select: { id: true, title: true } },
        },
      });

      res.json({ task });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/tasks/:id - delete task
router.delete('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
