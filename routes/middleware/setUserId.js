const { verifyToken } = require("../utils/tokens");

function setUserId(req, res, next) {
  const { token: accessToken } = req.headers;

  if (!accessToken) {
    return next();
  }

  try {
    const { userId } = verifyToken(accessToken);
    req.userId = userId;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = setUserId;
