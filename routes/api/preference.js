const express = require("express");
const router = express.Router();
const preferenceController = require("../controller/preference");

router.delete("/:category", preferenceController.deleteCategory);

router.post("/", preferenceController.addCategory);

router.get("/", preferenceController.getNewGoogleFitData);

module.exports = router;
