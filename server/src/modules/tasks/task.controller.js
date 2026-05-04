import Task from "./task.model.js";
import Bug from "../bugs/bug.model.js";
import Story from "../stories/story.model.js";
import User from "../auth/auth.model.js";
import Activity from "../admin/activity.model.js";

const populateOptions = [
  { path: "assignee", select: "name email avatar" },
  { path: "bug", select: "title status priority" },
  { path: "story", select: "title status" },
];

export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user.id })
      .populate(populateOptions)
      .sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

export const listTasks = async (req, res, next) => {
  try {
    const { status, assigneeId, storyId, bugId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assigneeId) filter.assignee = assigneeId;
    if (storyId) filter.story = storyId;
    if (bugId) filter.bug = bugId;

    const tasks = await Task.find(filter).populate(populateOptions).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate(populateOptions);
    if (!task) return res.status(404).json({ error: "Task not found." });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, status, assigneeId, bugId, storyId, dueDate } = req.body;

    if (bugId && !(await Bug.findById(bugId))) {
      return res.status(404).json({ error: "Referenced bug not found." });
    }
    if (storyId && !(await Story.findById(storyId))) {
      return res.status(404).json({ error: "Referenced story not found." });
    }
    if (assigneeId && !(await User.findById(assigneeId))) {
      return res.status(404).json({ error: "Assignee not found." });
    }

    const task = await Task.create({
      title,
      status: status || "TODO",
      assignee: assigneeId || null,
      bug: bugId || null,
      story: storyId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await task.populate(populateOptions);

    await Activity.create({
      action: "TASK_CREATED",
      details: `Task "${title}" created`,
      bug: bugId || null,
      user: req.user.id,
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const existing = await Task.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Task not found." });

    const data = {};
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.status !== undefined) data.status = req.body.status;
    if (req.body.assigneeId !== undefined) data.assignee = req.body.assigneeId || null;
    if (req.body.bugId !== undefined) data.bug = req.body.bugId || null;
    if (req.body.storyId !== undefined) data.story = req.body.storyId || null;
    if (req.body.dueDate !== undefined)
      data.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;

    const task = await Task.findByIdAndUpdate(req.params.id, data, { new: true }).populate(
      populateOptions
    );
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const existing = await Task.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Task not found." });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully." });
  } catch (err) {
    next(err);
  }
};
