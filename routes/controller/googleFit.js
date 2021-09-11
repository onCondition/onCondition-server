const createError = require("http-errors");

const ACCESS_LEVELS = require("../../constants/accessLevels");
const {
  getGoogleFitSessionData,
  getGoogleFitStepData,
  updateModels,
} = require("../services/googleFit");
const { ERROR } = require("../../constants/messages");
const { OK, UNAUTHORIZED } = require("../../constants/statusCodes");

async function postGoogleToken(req, res, next) {
  try {
    if (req.accessLevel !== ACCESS_LEVELS.CREATOR) {
      throw createError(UNAUTHORIZED);
    }

    const { accessToken } = req.body;

    if (!accessToken) {
      return next(createError(UNAUTHORIZED, ERROR.INVALID_TOKEN));
    }

    const { activities, sleeps } = await getGoogleFitSessionData(accessToken);
    const steps = await getGoogleFitStepData(accessToken);

    await updateModels({ activities, sleeps, steps }, req.creator);

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postGoogleToken,
};
