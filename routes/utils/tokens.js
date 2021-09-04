const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const {
  ISSUER, ACCESS_DURATION, REFRESH_DURATION
} = require("../../constants/tokenInfos");
const { ERROR } = require("../../constants/messages");
const { UNAUTHORIZED } = require("../../constants/statusCodes");
const {
  TOKEN_EXPIRED_ERROR,
  JSON_WEB_TOKEN_ERROR
} = require("../../constants/errors");

function generateToken(userId, isRefreshToken = false) {
  const secret = isRefreshToken
    ? process.env.REFRESH_TOKEN_SECRET
    : process.env.ACCESS_TOKEN_SECRET;
  const duration = isRefreshToken ? REFRESH_DURATION : ACCESS_DURATION;

  return jwt.sign({ userId }, secret, {
    expiresIn: duration,
    issuer: ISSUER,
  });
}

function verifyToken(token, isRefreshToken = false) {
  const secret = isRefreshToken
    ? process.env.REFRESH_TOKEN_SECRET
    : process.env.ACCESS_TOKEN_SECRET;

  try {
    const decoded = jwt.verify(token, secret);

    return decoded;
  } catch (err) {
    if (err?.name === TOKEN_EXPIRED_ERROR) {
      throw createError(UNAUTHORIZED, ERROR.TOKEN_EXPIRED);
    }

    if (err?.name === JSON_WEB_TOKEN_ERROR) {
      throw createError(UNAUTHORIZED, ERROR.INVALID_TOKEN);
    }

    throw createError(UNAUTHORIZED, ERROR.REQUIRE_LOGIN);
  }
}

module.exports = { generateToken, verifyToken };
