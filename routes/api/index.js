const express = require("express");
const router = express.Router();
const indexController = require("../controller/index");

router.get("/", indexController.getCondition);

router.get("/profile", indexController.getProfile);

router.post("/refresh", indexController.postRefresh);

module.exports = router;
