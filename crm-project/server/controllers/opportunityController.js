const Opportunity = require("../models/Opportunity");
const { logAction } = require("../middleware/auditLog");

const VALID_STAGES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

const scopeToUser = (req, filter = {}) => {
  if (req.user.role !== "admin") {
    filter.assignedTo = req.user._id;
  }
  return filter;
};

// @route GET /api/opportunities?stage=&assignedTo=
exports.getOpportunities = async (req, res) => {
  try {
    const { stage, assignedTo } = req.query;
    const filter = scopeToUser(req, {});
    if (stage) filter.stage = stage;
    if (assignedTo && req.user.role === "admin") filter.assignedTo = assignedTo;

    const opportunities = await Opportunity.find(filter)
      .populate("customer", "companyName contactName")
      .populate("assignedTo", "name email")
      .sort({ updatedAt: -1 });
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/opportunities/pipeline - grouped by stage for Kanban view
exports.getPipeline = async (req, res) => {
  try {
    const filter = scopeToUser(req, {});
    const opportunities = await Opportunity.find(filter)
      .populate("customer", "companyName contactName")
      .populate("assignedTo", "name email");

    const board = VALID_STAGES.reduce((acc, stage) => {
      acc[stage] = opportunities.filter((o) => o.stage === stage);
      return acc;
    }, {});

    const openValue = opportunities
      .filter((o) => !["Won", "Lost"].includes(o.stage))
      .reduce((sum, o) => sum + o.value, 0);

    res.json({ board, openPipelineValue: openValue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/opportunities
exports.createOpportunity = async (req, res) => {
  try {
    const { title, customer, value, expectedCloseDate, assignedTo, stage } = req.body;
    if (!title || !customer) {
      return res.status(400).json({ message: "Title and customer are required" });
    }
    const opportunity = await Opportunity.create({
      title,
      customer,
      value,
      expectedCloseDate,
      stage: VALID_STAGES.includes(stage) ? stage : "New",
      assignedTo: req.user.role === "admin" && assignedTo ? assignedTo : req.user._id,
    });
    await logAction(req, { action: "CREATE", entity: "Opportunity", entityId: opportunity._id });
    res.status(201).json(opportunity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/opportunities/:id
exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne(scopeToUser(req, { _id: req.params.id }));
    if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });
    Object.assign(opportunity, req.body);
    await opportunity.save();
    await logAction(req, { action: "UPDATE", entity: "Opportunity", entityId: opportunity._id });
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/opportunities/:id/stage - used by Kanban drag & drop
exports.moveStage = async (req, res) => {
  try {
    const { stage } = req.body;
    if (!VALID_STAGES.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage" });
    }
    const opportunity = await Opportunity.findOne(scopeToUser(req, { _id: req.params.id }));
    if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });

    const fromStage = opportunity.stage;
    opportunity.stage = stage;
    await opportunity.save();

    await logAction(req, {
      action: "STAGE_CHANGE",
      entity: "Opportunity",
      entityId: opportunity._id,
      meta: { from: fromStage, to: stage },
    });
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/opportunities/:id
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findOneAndDelete(scopeToUser(req, { _id: req.params.id }));
    if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });
    await logAction(req, { action: "DELETE", entity: "Opportunity", entityId: opportunity._id });
    res.json({ message: "Opportunity deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
