const express = require("express");
const router = express.Router();
const gridController = require("../controller/customGrid");
const requiresLogin = require("../middleware/requiresLogin");

router.get("/", requiresLogin, gridController.getGrid);

router.post("/", gridController.postGrid);

router.get("/:id", gridController.getGridDetail);

router.patch("/:id", gridController.patchGridDetail);

router.delete("/:id", gridController.deleteGridDetail);

module.exports = router;