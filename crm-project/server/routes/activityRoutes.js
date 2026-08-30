const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getDueFollowUps,
  createActivity,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");

router.use(protect);

router.get("/due", getDueFollowUps);
router.post("/", createActivity);
router.route("/:id").put(updateActivity).delete(deleteActivity);

module.exports = router;
