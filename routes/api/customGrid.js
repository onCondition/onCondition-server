const express = require("express");
const router = express.Router();
const gridController = require("../controller/customGrid");
const requiresLogin = require("../middleware/setAccessLeve;");

router.get("/:category", gridController.getGrid);

router.post("/:category", gridController.postGrid);

router.get("/:categoty/:id", gridController.getGridDetail);

router.patch("/:category/:id", gridController.patchGridDetail);

router.delete("/:category/:id", gridController.deleteGridDetail);

module.exports = router;
