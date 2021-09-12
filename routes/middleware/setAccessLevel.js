const mongoose = require("mongoose");
const ACCESS_LEVELS = require("../../constants/accessLevels");

function setAccessLevel(req, res, next) {
  const { userId, creator } = req;

  if (!userId) {
    req.accessLevel = ACCESS_LEVELS.GUEST;

    return next();
  }

  try {
    if (!creator) {
      return next();
    }

    if (userId === creator.id) {
      req.accessLevel = ACCESS_LEVELS.CREATOR;

      return next();
    }

    if (creator.friends.includes(mongoose.Types.ObjectId(userId))) {
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
