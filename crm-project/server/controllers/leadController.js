const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Opportunity = require("../models/Opportunity");
const { logAction } = require("../middleware/auditLog");

// Scope: admins see all leads, sales reps see only their own
const scopeToUser = (req, filter = {}) => {
  if (req.user.role !== "admin") {
    filter.assignedTo = req.user._id;
  }
  return filter;
};

// @route GET /api/leads?search=&status=&source=&assignedTo=
exports.getLeads = async (req, res) => {
  try {
    const { search, status, source, assignedTo } = req.query;
    const filter = scopeToUser(req, {});

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (assignedTo && req.user.role === "admin") filter.assignedTo = assignedTo;
    if (search) filter.$text = { $search: search };

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne(scopeToUser(req, { _id: req.params.id })).populate(
      "assignedTo",
      "name email"
    );
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Simple duplicate detection: same email OR same company+contact name
const findPotentialDuplicate = async (companyName, email, excludeId = null) => {
  const query = {
    $or: [
      email ? { email } : null,
      companyName ? { companyName: new RegExp(`^${companyName}$`, "i") } : null,
    ].filter(Boolean),
  };
  if (excludeId) query._id = { $ne: excludeId };
  return Lead.findOne(query);
};

// @route POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const { companyName, contactName, email, phone, source, notes, assignedTo } = req.body;
    if (!companyName || !contactName) {
      return res.status(400).json({ message: "Company name and contact name are required" });
    }

    const duplicate = await findPotentialDuplicate(companyName, email);

    const lead = await Lead.create({
      companyName,
      contactName,
      email,
      phone,
      source,
      notes,
      assignedTo: req.user.role === "admin" && assignedTo ? assignedTo : req.user._id,
      isDuplicateOf: duplicate ? duplicate._id : null,
    });

    await logAction(req, { action: "CREATE", entity: "Lead", entityId: lead._id });
    res.status(201).json({ lead, duplicateWarning: duplicate ? true : false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOne(scopeToUser(req, { _id: req.params.id }));
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    Object.assign(lead, req.body);
    await lead.save();

    await logAction(req, { action: "UPDATE", entity: "Lead", entityId: lead._id });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete(scopeToUser(req, { _id: req.params.id }));
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    await logAction(req, { action: "DELETE", entity: "Lead", entityId: lead._id });
    res.json({ message: "Lead deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/leads/:id/convert
// Converts a qualified lead into a Customer + Opportunity
exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findOne(scopeToUser(req, { _id: req.params.id }));
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    if (lead.status === "converted") {
      return res.status(400).json({ message: "Lead already converted" });
    }

    const { dealTitle, dealValue, expectedCloseDate } = req.body;

    const customer = await Customer.create({
      companyName: lead.companyName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      originatingLead: lead._id,
      accountOwner: lead.assignedTo,
    });

    const opportunity = await Opportunity.create({
      title: dealTitle || `${lead.companyName} - New Deal`,
      customer: customer._id,
      lead: lead._id,
      value: dealValue || 0,
      expectedCloseDate: expectedCloseDate || null,
      assignedTo: lead.assignedTo,
      stage: "Qualified",
    });

    lead.status = "converted";
    lead.convertedToCustomer = customer._id;
    lead.convertedToOpportunity = opportunity._id;
    await lead.save();

    await logAction(req, { action: "CONVERT", entity: "Lead", entityId: lead._id });
    res.json({ lead, customer, opportunity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
