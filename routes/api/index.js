const express = require("express");
const router = express.Router();
const indexController = require("../controller/index");

router.post("/login", indexController.postLogin);

router.post("/logout", indexController.postLogout);

router.get("/users/:userId/condition", indexController.getCondition);

module.exports = router;
