import Comment from "./comment.model.js";
import Bug from "../bugs/bug.model.js";
import Activity from "../admin/activity.model.js";
import { emit, EVENTS } from "../../services/socketService.js";

export const addComment = async (req, res, next) => {
  try {
    const { content, bugId } = req.body;

    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ error: "Bug not found." });

    const comment = await Comment.create({
      content,
      bug: bugId,
      author: req.user.id,
    });

    await comment.populate({ path: "author", select: "name email avatar" });

    await Activity.create({
      action: "COMMENT_ADDED",
      details: `Comment added on bug "${bug.title}"`,
      bug: bugId,
      user: req.user.id,
    });

    emit(req.app, EVENTS.COMMENT_ADDED, comment);
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

export const getBugComments = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.bugId);
    if (!bug) return res.status(404).json({ error: "Bug not found." });

    const comments = await Comment.find({ bug: req.params.bugId })
      .populate({ path: "author", select: "name email avatar" })
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (err) {
    next(err);
  }
};
