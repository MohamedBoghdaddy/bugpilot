const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const authenticate = require("../middleware/auth");
const { emit, EVENTS } = require("../services/socketService");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// POST /api/comments - add comment to a bug
router.post(
  "/",
  [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content is required"),
    body("bugId").isUUID().withMessage("Valid bug ID is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, bugId } = req.body;

      const bug = await prisma.bug.findUnique({ where: { id: bugId } });
      if (!bug) {
        return res.status(404).json({ error: "Bug not found." });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          bugId,
          authorId: req.user.id,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });

      await prisma.activity.create({
        data: {
          action: "COMMENT_ADDED",
          details: `Comment added on bug "${bug.title}"`,
          bugId,
          userId: req.user.id,
        },
      });

      emit(req.app, EVENTS.COMMENT_ADDED, comment);
      res.status(201).json({ comment });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/comments/bug/:bugId - get comments for a bug
router.get("/bug/:bugId", param("bugId").isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bug = await prisma.bug.findUnique({
      where: { id: req.params.bugId },
    });
    if (!bug) {
      return res.status(404).json({ error: "Bug not found." });
    }

    const comments = await prisma.comment.findMany({
      where: { bugId: req.params.bugId },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ comments });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
