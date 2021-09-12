const createError = require("http-errors");
const mongoose = require("mongoose");

const Comment = require("../../models/Comment");
const Activity = require("../../models/Activity");
const Album = require("../../models/CustomAlbum");
const Grid = require("../../models/CustomGrid");
const Meal = require("../../models/Meal");
const Sleep = require("../../models/Sleep");

const ACCESS_LEVELS = require("../../constants/accessLevels");
const {
  OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED,
} = require("../../constants/statusCodes");
const { ERROR } = require("../../constants/messages");

const RatingModels = {
  Activity,
  Album,
  Grid,
  Meal,
  Sleep,
};

const categoryModelName = {
  activity: "Activity",
  album: "CustomAlbum",
  grid: "CustomGrid",
  meal: "Meal",
  sleep: "Sleep",
};

function getCategoryType(categoryName, customCategories) {
  if (["activity", "meal", "sleep"].includes(categoryName)) {
    return categoryName;
  }

  const categoryInfo = customCategories.find(
    ({ category }) => category === categoryName,
  );

  if (!categoryInfo) {
    return null;
  }

  return categoryInfo.category;
}

async function postComment(req, res, next) {
  const { creator, userId } = req;
  const { category, ratingId } = req.params;
  const { date, content } = req.body;
  const categoryType = getCategoryType(category, creator.customCategories);
  const modelName = categoryModelName[categoryType];

  try {
    if (req.accessLevel === ACCESS_LEVELS.GUEST) {
      throw createError(UNAUTHORIZED);
    }

    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      throw createError(NOT_FOUND);
    }

    if (!categoryType) {
      throw createError(BAD_REQUEST, ERROR.CATEGORY_NOT_FOUND);
    }

    const newComment = await Comment.create({
      category: modelName,
      ratingId,
      creator: userId,
      date,
      content,
    });

    const commentId = newComment._id;
    await RatingModels[modelName].findByIdAndUpdate(ratingId,
      { $push: { comments: [commentId] } });

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    next(err);
  }
}

function patchComment() {
  //
}

function deleteComment() {
  //
}

module.exports = { postComment, patchComment, deleteComment };
