const express = require("express");
const router = express.Router();
const loginController = require("../controller/login");

router.post("/login", loginController.postLogin);

router.post("/refresh", loginController.postRefresh);

module.exports = router;
