import express from "express";
import { body, param, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import authenticate from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/users - list all users (admin only)
router.get('/', authorize('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reportedBugs: true,
            assignedBugs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id - get user profile
router.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reportedBugs: true,
            assignedBugs: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/role - update user role (admin only)
router.patch(
  '/:id/role',
  authorize('ADMIN'),
  [
    param('id').isUUID(),
    body('role')
      .isIn(['CUSTOMER', 'TESTER', 'DEVELOPER', 'ADMIN'])
      .withMessage('Valid role is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { role: req.body.role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
        },
      });

      await prisma.activity.create({
        data: {
          action: 'ROLE_CHANGED',
          details: `Role changed from ${user.role} to ${req.body.role} for ${user.name}`,
          userId: req.user.id,
        },
      });

      res.json({ user: updated });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/users/:id - update user profile
router.patch(
  '/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('avatar').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Users can only update their own profile unless admin
      if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'You can only update your own profile.' });
      }

      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const data = {};
      if (req.body.name) data.name = req.body.name;
      if (req.body.email) data.email = req.body.email;
      if (req.body.avatar !== undefined) data.avatar = req.body.avatar;
      if (req.body.password) {
        data.password = await bcrypt.hash(req.body.password, 12);
      }

      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({ user: updated });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(409).json({ error: 'Email already in use.' });
      }
      next(err);
    }
  }
);

// DELETE /api/users/:id - deactivate user (admin only)
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

      if (req.user.id === req.params.id) {
        return res.status(400).json({ error: 'You cannot delete your own account.' });
      }

      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      await prisma.user.delete({ where: { id: req.params.id } });

      await prisma.activity.create({
        data: {
          action: 'USER_DELETED',
          details: `User ${user.name} (${user.email}) was deleted`,
          userId: req.user.id,
        },
      });

      res.json({ message: 'User deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
