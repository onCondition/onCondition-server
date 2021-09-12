const express = require("express");
const router = express.Router();
const createError = require("http-errors");

const User = require("../../models/User");
const firebase = require("../../config/firebase");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST } = require("../../constants/statusCodes");
const { generateToken } = require("../utils/tokens");

router.post("/login", async function postLogin(req, res, next) {
  const { token: idToken } = req.headers;

  try {
    const {
      uid, name, picture: profileUrl,
    } = await firebase.auth().verifyIdToken(idToken);
    const { doc: user } = await User.findOrCreate({
      uid, name, profileUrl,
    });

    const { _id: userId, customCategories } = user;
    const accessToken = generateToken(user._id);
    const refreshToken = generateToken(user._id, true);

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

module.exports = router;
