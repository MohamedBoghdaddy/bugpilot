import bcrypt from "bcryptjs";
import User from "../auth/auth.model.js";
import Bug from "../bugs/bug.model.js";
import Activity from "../admin/activity.model.js";

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "bugs",
          localField: "_id",
          foreignField: "reporter",
          as: "reportedBugs",
        },
      },
      {
        $lookup: {
          from: "bugs",
          localField: "_id",
          foreignField: "assignee",
          as: "assignedBugs",
        },
      },
      {
        $addFields: {
          id: "$_id",
          "_count.reportedBugs": { $size: "$reportedBugs" },
          "_count.assignedBugs": { $size: "$assignedBugs" },
        },
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0,
          reportedBugs: 0,
          assignedBugs: 0,
          __v: 0,
          _id: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });

    const [reportedBugs, assignedBugs, comments] = await Promise.all([
      Bug.countDocuments({ reporter: req.params.id }),
      Bug.countDocuments({ assignee: req.params.id }),
      Activity.countDocuments({ user: req.params.id }),
    ]);

    res.json({
      user: {
        ...user.toJSON(),
        _count: { reportedBugs, assignedBugs, comments },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Prevent demoting the last admin
    if (user.role === "ADMIN" && req.body.role !== "ADMIN") {
      const adminCount = await User.countDocuments({ role: "ADMIN" });
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot demote the last admin." });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select("-password");

    await Activity.create({
      action: "ROLE_CHANGED",
      details: `Role changed from ${user.role} to ${req.body.role} for ${user.name}`,
      user: req.user.id,
    });

    res.json({ success: true, message: "User role updated successfully", user: updated });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "You can only update your own profile." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const data = {};
    if (req.body.name) data.name = req.body.name;
    if (req.body.email) data.email = req.body.email;
    if (req.body.avatar !== undefined) data.avatar = req.body.avatar;
    if (req.body.password) data.password = await bcrypt.hash(req.body.password, 12);

    const updated = await User.findByIdAndUpdate(req.params.id, data, { new: true }).select(
      "-password"
    );
    res.json({ user: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already in use." });
    }
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    await User.findByIdAndDelete(req.params.id);

    await Activity.create({
      action: "USER_DELETED",
      details: `User ${user.name} (${user.email}) was deleted`,
      user: req.user.id,
    });

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    next(err);
  }
};
