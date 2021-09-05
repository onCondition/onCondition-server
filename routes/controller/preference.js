const createError = require("http-errors");
const User = require("../../models/User");
const CustomGrid = require("../../models/CustomGrid");
const CustomAlbum = require("../../models/CustomAlbum");
const Comments = require("../../models/Comments");
const { ERROR } = require("../../constants/messages");

async function deleteCategory(req, res, next) {
  try {
    const { category } = req.body;
    const user = await User.findById(req.userId);
    const categoryNames = user.customCategories;

    if (!categoryNames.length) {
      throw createError(BAD_REQUEST, ERROR.INVALID_ALREADY_DELETED_CATEGORY);
    }

    if (!!categoryNames.includes(category)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_ALREADY_DELETED_CATEGORY);
    }

    await User.findByIdAndUpdate(req.userId, { $pull: { "customCategories": { category } }});
    await Comments.deleteMany({ category });

    res.statusCode = 200;
    res.json({ result: "OK"});
  } catch (err) {
    next(err);
  }
};

async function addCategory(req, res, next) {
  try {
    const { category, categoryType } = req.body;
    const user = await User.findById(req.userId);
    const categoryNames = user.customCategories;

    if (Array.isArray(categoryNames) && categoryNames.length === 3) {
      throw createError(BAD_REQUEST, ERROR.INVALID_USING_MAX_CATEGORIES);
    }

    if (Array.isArray(categoryNames) && categoryNames.includes(category)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_OVERLAP_CATEGORY_NAME);
    }

    const modifiedCategory = await User.updateOne({ _id: req.userId },{ $push: { customCategories: [{category, categoryType}] }});

    res.statusCode = 201;
    res.json({ result: "OK", modifiedCategory });
  } catch (err) {
    next(err);
  }
};

async function getNewGoogleFitData(req, res, next) {

};

module.exports = { deleteCategory, addCategory, getNewGoogleFitData };
