const mongoose = require("mongoose");

const User = require("../../models/User");
const { verifyToken } = require("../utils/tokens");
const ACCESS_LEVELS = require("../../constants/accessLevels");

async function setAccessLevel(req, res, next) {
  const { token: accessToken } = req.headers;
  const { creator } = req;

  if (!accessToken) {
    req.accessLevel = ACCESS_LEVELS.GUEST;

    return next();
  }

  try {
    const { userId } = verifyToken(accessToken);
    req.userId = userId;

    if (!creator) {
      return next();
    }

    if (userId === creator) {
      req.accessLevel = ACCESS_LEVELS.CREATOR;

      return next();
    }

    const isFriend = await User.findOne({
      _id: creator, friends: { $all: [mongoose.Types.ObjectId(userId)] },
    });

    if (isFriend) {
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
