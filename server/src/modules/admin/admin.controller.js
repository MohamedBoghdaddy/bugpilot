import User from "../auth/auth.model.js";
import Bug from "../bugs/bug.model.js";
import Activity from "./activity.model.js";

export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBugs,
      openBugs,
      inProgressBugs,
      fixedBugs,
      closedBugs,
      criticalBugs,
      bugsByPriorityRaw,
      bugsByStatusRaw,
      usersByRoleRaw,
      totalActivities,
    ] = await Promise.all([
      User.countDocuments(),
      Bug.countDocuments(),
      Bug.countDocuments({ status: "OPEN" }),
      Bug.countDocuments({ status: "IN_PROGRESS" }),
      Bug.countDocuments({ status: "FIXED" }),
      Bug.countDocuments({ status: "CLOSED" }),
      Bug.countDocuments({ priority: "CRITICAL" }),
      Bug.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Bug.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Activity.countDocuments(),
    ]);

    const byPriority = bugsByPriorityRaw.reduce((acc, i) => { acc[i._id] = i.count; return acc; }, {});
    const byStatus = bugsByStatusRaw.reduce((acc, i) => { acc[i._id] = i.count; return acc; }, {});
    const byRole = usersByRoleRaw.reduce((acc, i) => { acc[i._id] = i.count; return acc; }, {});

    res.json({
      stats: {
        users: { total: totalUsers, byRole },
        bugs: {
          total: totalBugs,
          open: openBugs,
          inProgress: inProgressBugs,
          fixed: fixedBugs,
          closed: closedBugs,
          critical: criticalBugs,
          byPriority,
          byStatus,
        },
        totalActivities,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.userId) filter.user = req.query.userId;

    const [logs, total] = await Promise.all([
      Activity.find(filter)
        .populate({ path: "user", select: "name email" })
        .populate({ path: "bug", select: "title" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);

    res.json({ logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};
