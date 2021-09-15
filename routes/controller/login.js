const createError = require("http-errors");

const User = require("../../models/User");
const firebase = require("../../config/firebase");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST } = require("../../constants/statusCodes");
const { generateToken, verifyToken, parseBearer } = require("../helpers/tokens");

async function postLogin(req, res, next) {
  const { authorization } = req.headers;

  try {
    const idToken = parseBearer(authorization);
    const {
      uid, name, picture: profileUrl,
    } = await firebase.auth().verifyIdToken(idToken);

    const { doc: user } = await User.findOrCreate({
      uid,
    });

    if (user.profileUrl !== profileUrl || user.name !== name) {
      await user.update({
        name,
        profileUrl,
      });
    }

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
}

function postRefresh(req, res, next) {
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
}

module.exports = {
  postLogin,
  postRefresh,
};