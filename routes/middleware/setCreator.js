const mongoose = require("mongoose");
const createError = require("http-errors");

const User = require("../../models/User");

const { NOT_FOUND } = require("../../constants/statusCodes");
const { ERROR } = require("../../constants/messages");

async function setCreator(req, res, next) {
  const { creatorId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      next(createError(NOT_FOUND, ERROR.INVALID_PATH));
    }

    const {
      _id: id, friends, customCategories,
    } = await User.findById(creatorId);

    if (!id) {
      next(createError(NOT_FOUND, ERROR.INVALID_PATH));
    }

    req.creator = { id, friends, customCategories };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = setCreator;
