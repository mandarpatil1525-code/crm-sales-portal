const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { getSummary, getAuditLog } = require("../controllers/dashboardController");

router.use(protect);

router.get("/", getSummary);
router.get("/audit-log", roleCheck("admin"), getAuditLog);

module.exports = router;
