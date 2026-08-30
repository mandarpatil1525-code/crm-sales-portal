const Activity = require("../models/Activity");
const { logAction } = require("../middleware/auditLog");

// @route GET /api/activities/due - follow-ups due today or overdue, scoped to user
exports.getDueFollowUps = async (req, res) => {
  try {
    const filter = {
      isFollowUpDone: false,
      nextFollowUpDate: { $lte: new Date() },
    };
    if (req.user.role !== "admin") filter.createdBy = req.user._id;

    const activities = await Activity.find(filter)
      .populate("customer", "companyName contactName")
      .populate("createdBy", "name")
      .sort({ nextFollowUpDate: 1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/activities
exports.createActivity = async (req, res) => {
  try {
    const { customer, type, summary, nextFollowUpDate } = req.body;
    if (!customer || !summary) {
      return res.status(400).json({ message: "Customer and summary are required" });
    }
    const activity = await Activity.create({
      customer,
      type,
      summary,
      nextFollowUpDate: nextFollowUpDate || null,
      createdBy: req.user._id,
    });
    await logAction(req, { action: "CREATE", entity: "Activity", entityId: activity._id });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/activities/:id
exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (req.user.role !== "admin" && String(activity.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    Object.assign(activity, req.body);
    await activity.save();
    await logAction(req, { action: "UPDATE", entity: "Activity", entityId: activity._id });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/activities/:id
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (req.user.role !== "admin" && String(activity.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await activity.deleteOne();
    await logAction(req, { action: "DELETE", entity: "Activity", entityId: activity._id });
    res.json({ message: "Activity deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
