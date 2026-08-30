const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getOpportunities,
  getPipeline,
  createOpportunity,
  updateOpportunity,
  moveStage,
  deleteOpportunity,
} = require("../controllers/opportunityController");

router.use(protect);

router.get("/pipeline", getPipeline);
router.route("/").get(getOpportunities).post(createOpportunity);
router.route("/:id").put(updateOpportunity).delete(deleteOpportunity);
router.patch("/:id/stage", moveStage);

module.exports = router;
