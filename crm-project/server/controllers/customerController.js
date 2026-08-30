const Customer = require("../models/Customer");
const Activity = require("../models/Activity");
const { logAction } = require("../middleware/auditLog");

const scopeToUser = (req, filter = {}) => {
  if (req.user.role !== "admin") {
    filter.accountOwner = req.user._id;
  }
  return filter;
};

// @route GET /api/customers?search=
exports.getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = scopeToUser(req, {});
    if (search) filter.$text = { $search: search };

    const customers = await Customer.find(filter)
      .populate("accountOwner", "name email")
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/customers/:id - profile + interaction history
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne(scopeToUser(req, { _id: req.params.id })).populate(
      "accountOwner",
      "name email"
    );
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const activities = await Activity.find({ customer: customer._id })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json({ customer, activities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/customers
exports.createCustomer = async (req, res) => {
  try {
    const { companyName, contactName, email, phone, address, notes } = req.body;
    if (!companyName || !contactName) {
      return res.status(400).json({ message: "Company name and contact name are required" });
    }
    const customer = await Customer.create({
      companyName,
      contactName,
      email,
      phone,
      address,
      notes,
      accountOwner: req.user._id,
    });
    await logAction(req, { action: "CREATE", entity: "Customer", entityId: customer._id });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne(scopeToUser(req, { _id: req.params.id }));
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    Object.assign(customer, req.body);
    await customer.save();
    await logAction(req, { action: "UPDATE", entity: "Customer", entityId: customer._id });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/customers/:id
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete(scopeToUser(req, { _id: req.params.id }));
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    await logAction(req, { action: "DELETE", entity: "Customer", entityId: customer._id });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
