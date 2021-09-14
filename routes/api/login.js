const express = require("express");
const router = express.Router();
const createError = require("http-errors");

const User = require("../../models/User");
const firebase = require("../../config/firebase");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST } = require("../../constants/statusCodes");
const { generateToken, verifyToken, parseBearer } = require("../helpers/tokens");

router.post("/login", async function postLogin(req, res, next) {
  const { authorization } = req.headers;

  try {
    const idToken = parseBearer(authorization);
    const {
      uid, name, picture: profileUrl,
    } = await firebase.auth().verifyIdToken(idToken);
    const userData = await User.findOrCreate({
      uid,
    }).update({
      name,
      profileUrl,
    }, {
      upsert: true,
    });

    const { _id: userId, customCategories } = userData.user;
    const accessToken = generateToken(userData.user._id);
    const refreshToken = generateToken(userData.user._id, true);

    res.status(OK);
    res.json({
      userId,
      customCategories,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(createError(BAD_REQUEST, ERROR.INVALID_TOKEN));
  }
});

router.post("/refresh", function postRefresh(req, res, next) {
  const { authorization } = req.headers;

  try {
    const refreshToken = parseBearer(authorization);
    const { userId } = verifyToken(refreshToken, true);
    const accessToken = generateToken(userId);

    res.status(OK);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
