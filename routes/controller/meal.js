const User = require("../../models/User");
const { ERROR } = require("../../constants/messages");

async function getMeal(req, res, next) {
  res.status(200);
  res.json({ result: 'ok' });
};

async function postMeal(req, res, next) {

};

async function getMealDetail(req, res, next) {

};

async function patchMealDetail(req, res, next) {

};

async function deleteMealDetail(req, res, next) {

};

module.exports = { getMeal, postMeal, getMealDetail, patchMealDetail, deleteMealDetail };
