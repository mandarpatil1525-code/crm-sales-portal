const Lead = require("../models/Lead");
const Opportunity = require("../models/Opportunity");
const Activity = require("../models/Activity");
const AuditLog = require("../models/AuditLog");

// @route GET /api/dashboard
// Role-aware: admins get org-wide numbers, reps get numbers scoped to themselves.
exports.getSummary = async (req, res) => {
  try {
    const leadFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const oppFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const actFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };

    const [totalLeads, qualifiedLeads, opportunities, followUpsDue] = await Promise.all([
      Lead.countDocuments(leadFilter),
      Lead.countDocuments({ ...leadFilter, status: "qualified" }),
      Opportunity.find(oppFilter),
      Activity.countDocuments({
        ...actFilter,
        isFollowUpDone: false,
        nextFollowUpDate: { $lte: new Date() },
      }),
    ]);

    const openOpportunities = opportunities.filter((o) => !["Won", "Lost"].includes(o.stage));
    const wonDeals = opportunities.filter((o) => o.stage === "Won");
    const lostDeals = opportunities.filter((o) => o.stage === "Lost");
    const pipelineValue = openOpportunities.reduce((sum, o) => sum + o.value, 0);

    const closedCount = wonDeals.length + lostDeals.length;
    const conversionRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;

    res.json({
      totalLeads,
      qualifiedLeads,
      openOpportunities: openOpportunities.length,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      pipelineValue,
      followUpsDue,
      conversionRate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/dashboard/audit-log (admin only)
exports.getAuditLog = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
