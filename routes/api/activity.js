const express = require("express");
const router = express.Router();
const activityController = require("../controller/activity");
const requiresLogin = require("../middleware/requiresLogin");

router.get("/", requiresLogin, activityController.getActivity);

router.get("/:id", requiresLogin, activityController.getActivityDetail);

router.patch("/:id", requiresLogin, activityController.patchActivityDetail);

router.delete("/:id", requiresLogin, activityController.deleteActivityDetail);

module.exports = router;
