import Story from "../models/Story.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";

const taskPopulate = { path: "assignee", select: "name email avatar" };

export const listStories = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const [stories, total] = await Promise.all([
      Story.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Story.countDocuments(filter),
    ]);

    const storiesWithTasks = await Promise.all(
      stories.map(async (story) => {
        const tasks = await Task.find({ story: story.id }).populate(taskPopulate);
        return { ...story.toJSON(), tasks };
      })
    );

    res.json({ stories: storiesWithTasks, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

export const getStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: "Story not found." });

    const tasks = await Task.find({ story: req.params.id })
      .populate(taskPopulate)
      .populate({ path: "bug", select: "title status" });

    res.json({ story: { ...story.toJSON(), tasks } });
  } catch (err) {
    next(err);
  }
};

export const createStory = async (req, res, next) => {
  try {
    const { title, description, status, priority, storyPoints } = req.body;

    const story = await Story.create({
      title,
      description: description || null,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      storyPoints: storyPoints || 0,
    });

    await Activity.create({
      action: "STORY_CREATED",
      details: `Story "${title}" created`,
      user: req.user.id,
    });

    res.status(201).json({ story });
  } catch (err) {
    next(err);
  }
};

export const updateStory = async (req, res, next) => {
  try {
    const existing = await Story.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Story not found." });

    const data = {};
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.status !== undefined) data.status = req.body.status;
    if (req.body.priority !== undefined) data.priority = req.body.priority;
    if (req.body.storyPoints !== undefined) data.storyPoints = req.body.storyPoints;

    const story = await Story.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ story });
  } catch (err) {
    next(err);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    const existing = await Story.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Story not found." });

    await Story.findByIdAndDelete(req.params.id);

    await Activity.create({
      action: "STORY_DELETED",
      details: `Story "${existing.title}" deleted`,
      user: req.user.id,
    });

    res.json({ message: "Story deleted successfully." });
  } catch (err) {
    next(err);
  }
};
