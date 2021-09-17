const mongoose = require("mongoose");
const createError = require("http-errors");

const User = require("../../models/User");
const firebase = require("../../config/firebase");
const { ERROR } = require("../../constants/messages");
const {
  OK, BAD_REQUEST, NOT_FOUND,
} = require("../../constants/statusCodes");
const { generateToken, verifyToken, parseBearer } = require("../helpers/tokens");

async function getUserInfos(req, res, next) {
  const { authorization } = req.headers;

  try {
    const accessToken = parseBearer(authorization);
    const { userId } = verifyToken(accessToken);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_TOKEN);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw createError(NOT_FOUND, ERROR.USER_NOT_FOUND);
    }

    const { customCategories, lastAccessDate } = user;

    res.status(OK);
    res.json({
      userId,
      customCategories,
      lastAccessDate,
    });
  } catch (err) {
    next(err);
  }
}

async function postLogin(req, res, next) {
  const { authorization } = req.headers;

  try {
    const idToken = parseBearer(authorization);
    const {
      uid, name, picture: profileUrl,
    } = await firebase.auth().verifyIdToken(idToken);

    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({ uid, profileUrl, name });
    }

    if (user.profileUrl !== profileUrl || user.name !== name) {
      await user.update({
        name,
        profileUrl,
      });
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateToken(user._id, true);

    res.status(OK);
    res.json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    next(createError(BAD_REQUEST, ERROR.INVALID_TOKEN));
  }
}

function postRefresh(req, res, next) {
  const { authorization } = req.headers;

  try {
    const refreshToken = parseBearer(authorization);
    const { userId } = verifyToken(refreshToken, true);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_TOKEN);
    }

    const accessToken = generateToken(userId);

    res.status(OK);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserInfos,
  postLogin,
  postRefresh,
};
