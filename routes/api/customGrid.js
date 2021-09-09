const express = require("express");
const router = express.Router();
const gridController = require("../controller/customGrid");
const requiresLogin = require("../middleware/requiresLogin");

router.get("/:category", requiresLogin, gridController.getGrid);

router.post("/:category", requiresLogin, gridController.postGrid);

router.get("/:categoty/:id", gridController.getGridDetail);

router.patch("/:category/:id", requiresLogin, gridController.patchGridDetail);

router.delete("/:category/:id", requiresLogin, gridController.deleteGridDetail);

module.exports = router;
