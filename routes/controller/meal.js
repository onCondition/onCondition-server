const Meal = require("../../models/Meal");
const { OK } = require("../../constants/statusCodes");

async function getMeal(req, res, next) {
  try {
    const pagenateOptions = {
      limit: 7,
      sort: { date: -1 },
    };

    if (req.page) {
      pagenateOptions.page = req.page;
    }

    const result = await Meal.paginate({ userId: req.userId }, pagenateOptions);
    res.status(OK);
    res.json({
      result: "ok",
      data: result.docs,
      nextPage: result.nextPage,
      prevPage: result.prevPage,
    });
  } catch (err) {
    next(err);
  }
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
