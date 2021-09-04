const express = require("express");
const router = express.Router();
const preferenceController = require("../controller/preference");

router.post("/", preferenceController.deleteCategory);

router.post("/", preferenceController.addCategory);

router.post("/", preferenceController.getDataManually);

module.exports = router;
