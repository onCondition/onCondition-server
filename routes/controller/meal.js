const createError = require("http-errors");
const mongoose = require("mongoose");

const Meal = require("../../models/Meal");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../../constants/statusCodes");

const {
  isValidUrl,
  isValidDate,
  isValidHeartCount,
  isValidText
} = require("../utils/validations");

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
  try {
    const { url, heartCount, text } = req.body;
    const date = new Date(req.body.date);

    if (!isValidUrl(url)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_URL);
    }

    if (!isValidDate(date)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_DATE);
    }

    if (!isValidHeartCount(heartCount)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_HEART_COUNT);
    }

    if (!isValidText(text)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_RATING_TEXT);
    }

    const newMeal = {
      userId: req.userId,
      url,
      date,
      rating: { heartCount, text },
    };

    await Meal.create(newMeal);

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errPaths = Object.keys(err.errors).join(", ");
      return next(createError(BAD_REQUEST, `${errPaths}이(가) 유효하지 않습니다`));
    }

    next(err);
  }
}

async function getMealDetail(req, res, next) {
  try {
    const mealId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mealId)) {
      throw createError(NOT_FOUND);
    }

    const mealData = await Meal.findById(mealId).populate("comments");

    if (!mealData) {
      throw createError(NOT_FOUND);
    }

    res.status(OK);
    res.json({ result: "ok", data: mealData });
  } catch (err) {
    next(err);
  }
}

async function patchMealDetail(req, res, next) {
  try {
    const mealId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mealId)) {
      throw createError(NOT_FOUND);
    }

    const { url, heartCount, text } = req.body;
    const date = new Date(req.body.date);

    if (!isValidUrl(url)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_URL);
    }

    if (!isValidDate(date)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_DATE);
    }

    if (!isValidHeartCount(heartCount)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_HEART_COUNT);
    }

    if (!isValidText(text)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_RATING_TEXT);
    }

    const result = await Meal.findByIdAndUpdate(mealId, {
      url, date, rating: { heartCount, text }
    });

    if (!result) {
      throw createError(NOT_FOUND);
    }

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errPaths = Object.keys(err.errors).join(", ");
      return next(createError(BAD_REQUEST, `${errPaths}이(가) 유효하지 않습니다`));
    }

    next(err);
  }
}

async function deleteMealDetail(req, res, next) {
  try {
    const mealId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mealId)) {
      throw createError(NOT_FOUND);
    }

    const result = await Meal.findByIdAndRemove(mealId);

    if (!result) {
      throw createError(NOT_FOUND);
    }

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMeal, postMeal, getMealDetail, patchMealDetail, deleteMealDetail
};
