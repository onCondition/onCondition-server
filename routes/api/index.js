const express = require("express");
const router = express.Router();
const indexController = require("../controller/index");
const requiresLogin = require("../middleware/requiresLogin");

router.post("/login", indexController.postLogin);

router.post("/refresh", indexController.postRefresh);

router.get("/condition", requiresLogin, indexController.getCondition);

module.exports = router;
