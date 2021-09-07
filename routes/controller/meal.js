const createError = require("http-errors");
const mongoose = require("mongoose");

const Meal = require("../../models/Meal");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../../constants/statusCodes");

const {
  validateBody, isValidUrl, isValidHeartCount, isValidText, isValidDate,
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

    const invalidValues = validateBody([
      [url, isValidUrl],
      [heartCount, isValidHeartCount],
      [text, isValidText],
      [date, isValidDate],
    ]);

    if (invalidValues.length) {
      throw createError(BAD_REQUEST, invalidValues + ERROR.INVALID_VALUE);
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

      return next(createError(BAD_REQUEST, errPaths + ERROR.INVALID_VALUE));
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

    const mealData = await Meal.findById(mealId).populate({
      path: "comments",
      populate: {
        path: "creator",
        select: "profileUrl, name",
      },
    });

    if (!mealData) {
      throw createError(NOT_FOUND);
    }

    res.status(OK);
    res.json({ result: "ok", data: mealData });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

async function patchMealDetail(req, res, next) {
  try {
    const mealId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mealId)) {
      throw createError(NOT_FOUND);
    }

    validateBody(req.body);

    const { url, heartCount, text } = req.body;
    const date = new Date(req.body.date);

    const result = await Meal.findByIdAndUpdate(mealId, {
      url, date, rating: { heartCount, text },
    });

    if (!result) {
      throw createError(NOT_FOUND);
    }

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errPaths = Object.keys(err.errors).join(", ");

      return next(createError(BAD_REQUEST, errPaths + ERROR.INVALID_VALUE));
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
  getMeal, postMeal, getMealDetail, patchMealDetail, deleteMealDetail,
};
