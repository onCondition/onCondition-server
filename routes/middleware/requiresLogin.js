const createError = require("http-errors");
const firebase = require("../../config/firebase");
const { ERROR } = require("../../constants/messages");
const { UNAUTHORIZED } = require("../../constants/statusCodes");

async function requiresLogin(req, res, next) {
  try {
    const token = req.headers.token;
    const decodedToken = await firebase.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;

    next();
  } catch (err) {
    if (err.code === "auth/id-token-revoked") {
      return next(createError(UNAUTHORIZED, ERROR.TOKEN_EXPIRED));
    }

    if (err.code === "app/invalid-credential") {
      return next(createError(UNAUTHORIZED, ERROR.REQUIRE_LOGIN));
    }

    next(err);
  }
}

module.exports = requiresLogin;
