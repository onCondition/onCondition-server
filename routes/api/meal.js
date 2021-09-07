const express = require("express");
const router = express.Router();
const mealController = require("../controller/meal");
const requiresLogin = require("../middleware/requiresLogin");

router.get("/", requiresLogin, mealController.getMeal);

router.post("/", requiresLogin, mealController.postMeal);

router.get("/:id", mealController.getMealDetail);

router.patch("/:id", mealController.patchMealDetail);

router.delete("/:id", mealController.deleteMealDetail);

module.exports = router;
