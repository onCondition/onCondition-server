const express = require("express");
const router = express.Router();
const indexController = require("../controller/index");

router.get("/", indexController.getCondition);

router.post("/refresh", indexController.postRefresh);

module.exports = router;
