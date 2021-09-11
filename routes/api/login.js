const express = require("express");
const router = express.Router();
const indexController = require("../controller/index");

router.post("/login", indexController.postLogin);

module.exports = router;
