const User = require("../../models/User");
const { ERROR } = require("../../constants/messages");
const { OK } = require("../../constants/statusCodes");

function getMeal(req, res, next) {
  res.status(OK);
  res.json({ result: "ok" });
}

async function postMeal(req, res, next) {
  //
}

async function getMealDetail(req, res, next) {
  //
}

async function patchMealDetail(req, res, next) {
  //
}

async function deleteMealDetail(req, res, next) {
  //
}

module.exports = {
  getMeal, postMeal, getMealDetail, patchMealDetail, deleteMealDetail
};
