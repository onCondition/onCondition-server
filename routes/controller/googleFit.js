const createError = require("http-errors");

const {
  getGoogleFitSessionData,
  getGoogleFitStepData,
  updateModels,
} = require("../services/googleFit");
const { ERROR } = require("../../constants/messages");
const { OK, UNAUTHORIZED } = require("../../constants/statusCodes");

async function postGoogleToken(req, res, next) {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return next(createError(UNAUTHORIZED, ERROR.INVALID_TOKEN));
    }

    const { activities, sleeps } = await getGoogleFitSessionData(accessToken);
    const steps = await getGoogleFitStepData(accessToken);

    await updateModels({ activities, sleeps, steps });

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postGoogleToken,
};
