const createError = require("http-errors");

const User = require("../../models/User");
const Step = require("../../models/Step");
const Activity = require("../../models/Activity");
const Sleep = require("../../models/Sleep");
const Meal = require("../../models/Meal");
const CustomGrid = require("../../models/CustomGrid");
const CustomAlbum = require("../../models/CustomAlbum");
const Comment = require("../../models/Comment");

const getPastISOTime = require("../utils/getPastISOTime");
const { validateBody, isValidText } = require("../utils/validations");
const { ERROR } = require("../../constants/messages");
const { BAD_REQUEST } = require("../../constants/statusCodes");
const NUMBERS = require("../../constants/numbers");

async function deleteCategory(req, res, next) {
  try {
    const { category } = req.body;
    const user = await User.findById(req.userId);
    const categoryNames = user.customCategories;

    const invalidValues = validateBody([
      [category, isValidText],
    ]);

    if (invalidValues.length) {
      throw createError(BAD_REQUEST, invalidValues + ERROR.INVALID_VALUE);
    }

    if (!categoryNames.length) {
      throw createError(BAD_REQUEST, ERROR.INVALID_ALREADY_DELETED_CATEGORY);
    }

    if (categoryNames.includes(category)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_ALREADY_DELETED_CATEGORY);
    }

    await User.findByIdAndUpdate(req.userId,
      { $pull: { customCategories: { category } } });

    await Comment.deleteMany({ category });

    res.statusCode = 200;
    res.json({ result: "OK" });
  } catch (err) {
    next(err);
  }
}

async function addCategory(req, res, next) {
  try {
    const { category, categoryType } = req.body;
    const user = await User.findById(req.userId);
    const categoryNames = user.customCategories;

    const invalidValues = validateBody([
      [category, isValidText],
      [categoryType, isValidText],
    ]);

    if (invalidValues.length) {
      throw createError(BAD_REQUEST, invalidValues + ERROR.INVALID_VALUE);
    }

    if (
      Array.isArray(categoryNames)
      && categoryNames.length === NUMBERS.MAX_CATEGORIES
    ) {
      throw createError(BAD_REQUEST, ERROR.INVALID_USING_MAX_CATEGORIES);
    }

    if (Array.isArray(categoryNames) && categoryNames.includes(category)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_OVERLAP_CATEGORY_NAME);
    }

    const modifiedCategory = await User.updateOne({ _id: req.userId },
      { $push: { customCategories: [{ category, categoryType }] } });

    res.statusCode = 201;
    res.json({ result: "OK", modifiedCategory });
  } catch (err) {
    next(err);
  }
}

async function getNewGoogleFitData(req, res, next) {
  const user = await User.findOne(req.params.id);
  const customCategories = user.customCategories;

  const creator = user._id;
  const today = new Date();
  const { pastMidnight, pastAWeekAgo, pastAMonthAgo } = getPastISOTime(today);

  const lineDataPipe = [
    { $match: {
      userId: creator,
      startTime: {
        $gte: pastAWeekAgo,
        $lte: pastMidnight,
      },
    } }, { $group: {
      _id: "$startTime",
      average: { $avg: "$rating.heartCount" },
    } }, { $sort: { _id: -1 } },
  ];

  const organizedCategories = customCategories.map((custom) => {
    const customs = [];
    customs.push([custom[custom.category],custom.value]);

    return customs;
  });

  try {
    const count = await Step.findOne({ userId: creator, date: pastMidnight });
    const activityLineData = await Activity.aggregate(lineDataPipe).exec();
    const mealLineData = await Meal.aggregate(lineDataPipe).exec();
    const sleepLineData = await Sleep.aggregate(lineDataPipe).exec();

    res.status("OK");
    res.json({
      count,
      activityLineData,
      mealLineData,
      sleepLineData,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { addCategory, deleteCategory, getNewGoogleFitData };
