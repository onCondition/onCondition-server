const createError = require("http-errors");
const User = require("../../models/User");
const CustomGrid = require("../../models/CustomGrid");
const CustomAlbum = require("../../models/CustomAlbum");
const Comments = require("../../models/Comment");
const { ERROR } = require("../../constants/messages");
const { STATUS } = require("../../constants/statusCodes");
const NUMBERS = require("../../constants/numbers");

const { validateBody, isValidText } = require("../utils/validations");

async function deleteCategory(req, res, next) {
  try {
    const { category } = req.body;
    const user = await User.findById(req.userId);
    const categoryNames = user.customCategories;

    const invalidValues = validateBody([
      [category, isValidText],
    ]);

    if (invalidValues.length) {
      throw createError(STATUS.BAD_REQUEST,
        invalidValues + ERROR.INVALID_VALUE);
    }

    if (!categoryNames.length) {
      throw createError(STATUS.BAD_REQUEST,
        ERROR.INVALID_ALREADY_DELETED_CATEGORY);
    }

    if (categoryNames.includes(category)) {
      throw createError(STATUS.BAD_REQUEST,
        ERROR.INVALID_ALREADY_DELETED_CATEGORY);
    }

    await User.findByIdAndUpdate(req.userId,
      { $pull: { customCategories: { category } } });
    await Comments.deleteMany({ category });

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
    ]);

    if (invalidValues.length) {
      throw createError(STATUS.BAD_REQUEST,
        invalidValues + ERROR.INVALID_VALUE);
    }

    if (Array.isArray(categoryNames)
      && categoryNames.length === NUMBERS.MAX_CATEGORIES) {
      throw createError(STATUS.BAD_REQUEST, ERROR.INVALID_USING_MAX_CATEGORIES);
    }

    if (Array.isArray(categoryNames) && categoryNames.includes(category)) {
      throw createError(STATUS.BAD_REQUEST,
        ERROR.INVALID_OVERLAP_CATEGORY_NAME);
    }

    const modifiedCategory = await User.updateOne({ _id: req.userId },
      { $push: { customCategories: [{ category, categoryType }] } });
  } catch (err) {
    next(err);
  }
}

async function getNewGoogleFitData(req, res, next) {
//
}

module.exports = { deleteCategory, addCategory, getNewGoogleFitData };
