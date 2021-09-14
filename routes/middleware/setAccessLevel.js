const mongoose = require("mongoose");
const createError = require("http-errors");

const User = require("../../models/User");
const { verifyToken } = require("../utils/tokens");
const ACCESS_LEVELS = require("../../constants/accessLevels");
const { NOT_FOUND } = require("../../constants/statusCodes");
const { ERROR } = require("../../constants/messages");
const getPastISOTime = require("../utils/getPastISOTime");

async function setAccessLevel(req, res, next) {
  const { creatorId } = req.params;
  const { token: accessToken } = req.headers;
  const today = new Date();
  const { pastMidnight, pastTwoDayAgo } = getPastISOTime(today);

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
    const upsertData = {
      $set: {
        lastAccessDate: today,
      },
      $inc: {
        stroke: 1,
      },
    };

    const resetData = {
      $set: {
        lastAccessDate: today,
        stroke: 0,
      },
    };

    req.userId = userId;

    if (userId === creatorId) {
      if (
        creator.lastAccessDate > pastTwoDayAgo
        && creator.lastAccessDate < pastMidnight
      ) {
        creator.update(upsertData, { upsert: true });
      } else {
        creator.update(resetData);
      }
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
