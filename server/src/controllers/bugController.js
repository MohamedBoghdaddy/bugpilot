import Bug from "../models/Bug.js";
import Activity from "../models/Activity.js";
import Comment from "../models/Comment.js";
import Attachment from "../models/Attachment.js";
import User from "../models/User.js";
import { emit, EVENTS } from "../services/socketService.js";

const populateOptions = [
  { path: "reporter", select: "name email avatar" },
  { path: "assignee", select: "name email avatar" },
];

const BASE_FILTER = { deletedAt: null };

export const listBugs = async (req, res, next) => {
  try {
    const { status, priority, severity, assignee, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { ...BASE_FILTER };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (severity) filter.severity = severity;
    if (assignee) filter.assignee = assignee;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [bugs, total] = await Promise.all([
      Bug.find(filter)
        .populate(populateOptions)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Bug.countDocuments(filter),
    ]);

    res.json({ bugs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

export const getMyBugs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { ...BASE_FILTER, reporter: req.user.id };

    const [bugs, total] = await Promise.all([
      Bug.find(filter).populate(populateOptions).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Bug.countDocuments(filter),
    ]);

    res.json({ bugs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

export const getAssignedBugs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { ...BASE_FILTER, assignee: req.user.id };

    const [bugs, total] = await Promise.all([
      Bug.find(filter).populate(populateOptions).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Bug.countDocuments(filter),
    ]);

    res.json({ bugs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

export const getBug = async (req, res, next) => {
  try {
    const bug = await Bug.findOne({ _id: req.params.id, deletedAt: null }).populate(populateOptions);
    if (!bug) return res.status(404).json({ error: "Bug not found." });

    const [comments, attachments, activities] = await Promise.all([
      Comment.find({ bug: req.params.id })
        .populate({ path: "author", select: "name email avatar" })
        .sort({ createdAt: 1 }),
      Attachment.find({ bug: req.params.id })
        .populate({ path: "uploader", select: "name" })
        .sort({ createdAt: -1 }),
      Activity.find({ bug: req.params.id })
        .populate({ path: "user", select: "name" })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    res.json({ bug: { ...bug.toJSON(), comments, attachments, activities } });
  } catch (err) {
    next(err);
  }
};

export const createBug = async (req, res, next) => {
  try {
    const { title, description, stepsToReproduce, priority, severity, assigneeId, tags } = req.body;

    const bug = await Bug.create({
      title,
      description,
      stepsToReproduce: stepsToReproduce || null,
      priority: priority || "MEDIUM",
      severity: severity || "MAJOR",
      reporter: req.user.id,
      assignee: assigneeId || null,
      status: assigneeId ? "ASSIGNED" : "OPEN",
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
    });

    await bug.populate(populateOptions);

    await Activity.create({
      action: "BUG_CREATED",
      details: `Bug "${title}" created with ${priority || "MEDIUM"} priority`,
      bug: bug.id,
      user: req.user.id,
    });

    emit(req.app, EVENTS.BUG_CREATED, bug);
    res.status(201).json({ bug });
  } catch (err) {
    next(err);
  }
};

export const updateBug = async (req, res, next) => {
  try {
    const existing = await Bug.findOne({ _id: req.params.id, deletedAt: null });
    if (!existing) return res.status(404).json({ error: "Bug not found." });

    if (
      req.user.role === "CUSTOMER" &&
      existing.reporter !== req.user.id
    ) {
      return res.status(403).json({ error: "You can only edit bugs you reported." });
    }

    const { title, description, stepsToReproduce, status, priority, severity, assigneeId, tags } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (stepsToReproduce !== undefined) data.stepsToReproduce = stepsToReproduce;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (severity !== undefined) data.severity = severity;
    if (assigneeId !== undefined) data.assignee = assigneeId || null;
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags.slice(0, 10) : [];

    const bug = await Bug.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate(populateOptions);

    const changes = [];
    if (status && status !== existing.status) changes.push(`status: ${existing.status} → ${status}`);
    if (priority && priority !== existing.priority) changes.push(`priority: ${existing.priority} → ${priority}`);
    if (assigneeId !== undefined && assigneeId !== existing.assignee) changes.push("assignee changed");

    await Activity.create({
      action: "BUG_UPDATED",
      details: changes.length > 0 ? changes.join(", ") : "Bug details updated",
      bug: bug.id,
      user: req.user.id,
    });

    emit(req.app, EVENTS.BUG_UPDATED, bug);
    res.json({ bug });
  } catch (err) {
    next(err);
  }
};

export const assignBug = async (req, res, next) => {
  try {
    const existing = await Bug.findOne({ _id: req.params.id, deletedAt: null });
    if (!existing) return res.status(404).json({ error: "Bug not found." });

    const assignee = await User.findById(req.body.assigneeId);
    if (!assignee) return res.status(404).json({ error: "Assignee not found." });

    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      {
        assignee: req.body.assigneeId,
        status: existing.status === "OPEN" ? "ASSIGNED" : existing.status,
      },
      { new: true }
    ).populate(populateOptions);

    await Activity.create({
      action: "BUG_ASSIGNED",
      details: `Bug assigned to ${assignee.name}`,
      bug: bug.id,
      user: req.user.id,
    });

    emit(req.app, EVENTS.BUG_UPDATED, bug);
    res.json({ bug });
  } catch (err) {
    next(err);
  }
};

export const updateBugStatus = async (req, res, next) => {
  try {
    const existing = await Bug.findOne({ _id: req.params.id, deletedAt: null });
    if (!existing) return res.status(404).json({ error: "Bug not found." });

    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate(populateOptions);

    await Activity.create({
      action: "STATUS_CHANGED",
      details: `Status changed from ${existing.status} to ${req.body.status}`,
      bug: bug.id,
      user: req.user.id,
    });

    emit(req.app, EVENTS.BUG_UPDATED, bug);
    res.json({ bug });
  } catch (err) {
    next(err);
  }
};

export const updateBugPriority = async (req, res, next) => {
  try {
    const existing = await Bug.findOne({ _id: req.params.id, deletedAt: null });
    if (!existing) return res.status(404).json({ error: "Bug not found." });

    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      { priority: req.body.priority },
      { new: true }
    ).populate(populateOptions);

    await Activity.create({
      action: "PRIORITY_CHANGED",
      details: `Priority changed from ${existing.priority} to ${req.body.priority}`,
      bug: bug.id,
      user: req.user.id,
    });

    emit(req.app, EVENTS.BUG_UPDATED, bug);
    res.json({ bug });
  } catch (err) {
    next(err);
  }
};

export const deleteBug = async (req, res, next) => {
  try {
    const existing = await Bug.findOne({ _id: req.params.id, deletedAt: null });
    if (!existing) return res.status(404).json({ error: "Bug not found." });

    await Bug.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });

    await Activity.create({
      action: "BUG_DELETED",
      details: `Bug "${existing.title}" deleted`,
      bug: existing.id,
      user: req.user.id,
    });

    emit(req.app, EVENTS.BUG_DELETED, { id: req.params.id });
    res.json({ message: "Bug deleted successfully." });
  } catch (err) {
    next(err);
  }
};
