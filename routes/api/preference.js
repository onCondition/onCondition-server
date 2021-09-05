const express = require("express");
const router = express.Router();
const preferenceController = require("../controller/preference");

router.delete("/", preferenceController.deleteCategory);

router.post("/", preferenceController.addCategory);

router.get("/", preferenceController.getDataManually);

module.exports = router;
