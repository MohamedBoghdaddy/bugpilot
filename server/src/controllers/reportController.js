import Bug from "../models/Bug.js";
import Activity from "../models/Activity.js";

export const bugsByPriority = async (req, res, next) => {
  try {
    const raw = await Bug.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]);
    const data = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    raw.forEach((item) => { data[item._id] = item.count; });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const bugsByStatus = async (req, res, next) => {
  try {
    const raw = await Bug.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const data = { OPEN: 0, ASSIGNED: 0, IN_PROGRESS: 0, FIXED: 0, CLOSED: 0, VERIFIED: 0 };
    raw.forEach((item) => { data[item._id] = item.count; });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const velocity = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const resolved = await Activity.find({
      action: "STATUS_CHANGED",
      details: { $regex: /-> FIXED$/ },
      createdAt: { $gte: startDate },
    })
      .select("createdAt")
      .sort({ createdAt: 1 });

    const velocityMap = {};
    resolved.forEach((item) => {
      const dateKey = item.createdAt.toISOString().split("T")[0];
      velocityMap[dateKey] = (velocityMap[dateKey] || 0) + 1;
    });

    const result = [];
    const current = new Date(startDate);
    const today = new Date();
    while (current <= today) {
      const dateKey = current.toISOString().split("T")[0];
      result.push({ date: dateKey, resolved: velocityMap[dateKey] || 0 });
      current.setDate(current.getDate() + 1);
    }

    res.json({ velocity: result, totalResolved: resolved.length, days });
  } catch (err) {
    next(err);
  }
};
