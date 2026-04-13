import { classifyBugPriority, recommendAssignee, summarizeBug } from "../services/aiService.js";

export const classifyPriority = async (req, res, next) => {
  try {
    const result = await classifyBugPriority(req.body.description);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getRecommendedAssignee = async (req, res, next) => {
  try {
    const result = await recommendAssignee(req.body.title, req.body.description);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getBugSummary = async (req, res, next) => {
  try {
    const result = await summarizeBug(req.body.title, req.body.description);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
