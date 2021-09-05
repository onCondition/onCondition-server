const firebase = require("../../config/firebase");
const User = require("../../models/User");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST } = require("../../constants/statusCodes");
const { generateToken, verifyToken } = require("../utils/tokens");

async function postLogin(req, res, next) {
  const { token: idToken } = req.headers;

  try {
    const {
      uid, name, picture: profileUrl
    } = await firebase.auth().verifyIdToken(idToken);
    const { doc: user } = await User.findOrCreate({
      uid, name, profileUrl
    });

    const accessToken = generateToken(user._id);
    const refreshToken = generateToken(user._id, true);

    res.status(OK);
    res.json({
      accessToken,
      refreshToken
    });
  } catch (err) {
    next(createError(BAD_REQUEST, ERROR.INVALID_TOKEN));
  }

}

function postRefresh(req, res, next) {
  const { token: refreshToken } = req.headers;

  try {
    const { userId } = verifyToken(refreshToken, true);
    const accessToken = generateToken(userId);

    res.status(OK);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

async function getCondition(req, res, next) {
  //
}

module.exports = {
  postLogin, postRefresh, getCondition
};
