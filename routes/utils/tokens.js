const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const {
  ISSUER, ACCESS_DURATION, REFRESH_DURATION,
} = require("../../constants/tokenInfos");
const { ERROR } = require("../../constants/messages");
const { UNAUTHORIZED } = require("../../constants/statusCodes");
const { TokenExpiredError, JsonWebTokenError } = jwt;

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
    if (err instanceof TokenExpiredError) {
      throw createError(UNAUTHORIZED, ERROR.TOKEN_EXPIRED);
    }

    if (err instanceof JsonWebTokenError) {
      throw createError(UNAUTHORIZED, ERROR.INVALID_TOKEN);
    }

    throw createError(UNAUTHORIZED, ERROR.REQUIRE_LOGIN);
  }
}

module.exports = { generateToken, verifyToken };
