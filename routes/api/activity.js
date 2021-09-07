const express = require("express");
const router = express.Router();
const activityController = require("../controller/activity");
const requiresLogin = require("../middleware/requiresLogin");

router.get("/", requiresLogin, activityController.getActivity);

router.get("/:id", activityController.getActivityDetail);

router.patch("/:id", activityController.patchActivityDetail);

router.delete("/:id", activityController.deleteActivityDetail);

module.exports = router;
