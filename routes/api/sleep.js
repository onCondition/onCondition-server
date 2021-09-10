const express = require("express");
const router = express.Router();
const sleepController = require("../controller/sleep");
const requiresLogin = require("../middleware/requiresLogin");

router.get("/", requiresLogin, sleepController.getSleep);

router.get("/:id", requiresLogin, sleepController.getSleepDetail);

router.patch("/:id", requiresLogin, sleepController.patchSleepDetail);

router.delete("/:id", requiresLogin, sleepController.deleteSleepDetail);

module.exports = router;
