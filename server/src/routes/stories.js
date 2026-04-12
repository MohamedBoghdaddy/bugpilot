import express from "express";
import { body, param, query, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import authenticate from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/stories - list all stories
router.get(
  '/',
  [
    query('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, priority } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;

      const [stories, total] = await Promise.all([
        prisma.story.findMany({
          where,
          include: {
            tasks: {
              include: {
                assignee: { select: { id: true, name: true, avatar: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.story.count({ where }),
      ]);

      res.json({
        stories,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/stories/:id - get story details
router.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const story = await prisma.story.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            bug: { select: { id: true, title: true, status: true } },
          },
        },
      },
    });

    if (!story) {
      return res.status(404).json({ error: 'Story not found.' });
    }

    res.json({ story });
  } catch (err) {
    next(err);
  }
});

// POST /api/stories - create story
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    body('storyPoints').optional().isInt({ min: 0 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, status, priority, storyPoints } = req.body;

      const story = await prisma.story.create({
        data: {
          title,
          description,
          status: status || 'TODO',
          priority: priority || 'MEDIUM',
          storyPoints: storyPoints || 0,
        },
      });

      await prisma.activity.create({
        data: {
          action: 'STORY_CREATED',
          details: `Story "${title}" created`,
          userId: req.user.id,
        },
      });

      res.status(201).json({ story });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/stories/:id - update story
router.patch(
  '/:id',
  [
    param('id').isUUID(),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    body('storyPoints').optional().isInt({ min: 0 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await prisma.story.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Story not found.' });
      }

      const data = {};
      if (req.body.title !== undefined) data.title = req.body.title;
      if (req.body.description !== undefined) data.description = req.body.description;
      if (req.body.status !== undefined) data.status = req.body.status;
      if (req.body.priority !== undefined) data.priority = req.body.priority;
      if (req.body.storyPoints !== undefined) data.storyPoints = req.body.storyPoints;

      const story = await prisma.story.update({
        where: { id: req.params.id },
        data,
      });

      res.json({ story });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/stories/:id - delete story
router.delete('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existing = await prisma.story.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Story not found.' });
    }

    await prisma.story.delete({ where: { id: req.params.id } });

    await prisma.activity.create({
      data: {
        action: 'STORY_DELETED',
        details: `Story "${existing.title}" deleted`,
        userId: req.user.id,
      },
    });

    res.json({ message: 'Story deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
