const mongoose = require("mongoose");
const createError = require("http-errors");

const User = require("../../models/User");
const { verifyToken } = require("../utils/tokens");
const ACCESS_LEVELS = require("../../constants/accessLevels");
const { NOT_FOUND } = require("../../constants/statusCodes");
const { ERROR } = require("../../constants/messages");

async function setAccessLevel(req, res, next) {
  const { creatorId } = req.params;
  const { token: accessToken } = req.headers;

  try {
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      throw createError(NOT_FOUND, ERROR.INVALID_PATH);
    }

    const creator = await User.findById(creatorId);

    if (!creator) {
      throw createError(NOT_FOUND, ERROR.INVALID_PATH);
    }

    const { friends, customCategories } = creator;
    req.creator = { id: creatorId, customCategories, friends };

    if (!accessToken) {
      req.accessLevel = ACCESS_LEVELS.GUEST;

      return next();
    }

    const { userId } = verifyToken(accessToken);
    req.userId = userId;

    if (userId === creatorId) {
      req.accessLevel = ACCESS_LEVELS.CREATOR;
    } else if (friends.includes(mongoose.Types.ObjectId(userId))) {
      req.accessLevel = ACCESS_LEVELS.FRIEND;
    } else {
      req.accessLevel = ACCESS_LEVELS.GUEST;
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = setAccessLevel;
