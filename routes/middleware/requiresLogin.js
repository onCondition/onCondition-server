import { ERROR } from "../../constants/messages";

const firebase = require("../../config/firebase");
const createError = require("http-errors");

async function requiresLogin(req, res, next) {
  try {
    const token = req.headers.token;
    const decodedToken = await firebase.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;

    next();
  } catch(err) {
    if (err.code == "auth/id-token-revoked") {
      return next(createError(401, ERROR.TOKEN_EXPIRED));
    }

    if (err.code === "app/invalid-credential") {
      return next(createError(401, ERROR.REQUIRE_LOGIN));
    }

    next(err);
  }
}

module.exports = requiresLogin;
