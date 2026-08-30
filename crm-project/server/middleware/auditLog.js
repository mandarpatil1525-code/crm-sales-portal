const AuditLog = require("../models/AuditLog");

// Attach after a mutating route handler via res.locals, or wrap route logic.
// Usage: call logAction(req, { action: "CREATE", entity: "Lead", entityId, meta }) inside a controller.
const logAction = async (req, { action, entity, entityId, meta = {} }) => {
  try {
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      action,
      entity,
      entityId,
      method: req.method,
      path: req.originalUrl,
      meta,
    });
  } catch (err) {
    // Never let logging failures break the main request
    console.error("Audit log error:", err.message);
  }
};

module.exports = { logAction };
