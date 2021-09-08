const express = require("express");
const router = express.Router();
const googleFitController = require("../controller/googleFit");
const requiresLogin = require("../middleware/requiresLogin");

router.post("/", requiresLogin, googleFitController.postGoogleToken);

module.exports = router;
