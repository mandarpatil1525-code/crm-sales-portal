const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
} = require("../controllers/leadController");
const { exportLeadsCsv, importLeadsCsv } = require("../controllers/csvController");

router.use(protect);

router.get("/export/csv", exportLeadsCsv);
router.post("/import/csv", importLeadsCsv);

router.route("/").get(getLeads).post(createLead);
router.route("/:id").get(getLead).put(updateLead).delete(deleteLead);
router.post("/:id/convert", convertLead);

module.exports = router;
