const { verifyToken } = require("../utils/tokens");

function requiresLogin(req, res, next) {
  const { token: accessToken } = req.headers;

  try {
    const user = verifyToken(accessToken);

    req.userId = user.userId;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requiresLogin;
