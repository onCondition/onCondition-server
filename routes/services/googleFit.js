/* eslint-disable max-len */
const createError = require("http-errors");
const mongoose = require("mongoose");
const axios = require("axios");

const Activity = require("../../models/Activity");
const Sleep = require("../../models/Sleep");
const Step = require("../../models/Step");

const {
  parseSession,
  parseSteps,
  getDateMillis,
} = require("../utils/googleFit");

const { ERROR } = require("../../constants/messages");
const { BAD_REQUEST, UNAUTHORIZED, INTERNAL_SERVER_ERROR } = require("../../constants/statusCodes");

const SESSIONS_URL = "https://fitness.googleapis.com/fitness/v1/users/me/sessions";
const DATASET_URL = "https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate";
const STEP_DATA_TYPE_NAME = "com.google.step_count.delta";
const STEP_DATA_SOURCE_ID = "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps";
const ONE_DAY_IN_MS = 86_400_000;

async function getGoogleFitSessionData(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  try {
    const { data } = await axios.get(SESSIONS_URL, { headers });
    const { session } = data;
    const { sleeps, activities } = parseSession(session);

    return { sleeps, activities };
  } catch (err) {
    if (!axios.isAxiosError(err)) {
      throw createError(INTERNAL_SERVER_ERROR);
    }

    if (err.response.status === UNAUTHORIZED) {
      throw createError(UNAUTHORIZED);
    }

    throw createError(INTERNAL_SERVER_ERROR, ERROR.GOOGLE_API_NOT_AVAILABLE);
  }
}

async function getGoogleFitStepData(accessToken) {
  const { startTimeMillis, endTimeMillis } = getDateMillis();
  const headers = { Authorization: `Bearer ${accessToken}` };
  const body = {
    aggregateBy: [{
      dataTypeName: STEP_DATA_TYPE_NAME,
      dataSourceId: STEP_DATA_SOURCE_ID,
    }],
    bucketByTime: { durationMillis: ONE_DAY_IN_MS },
    startTimeMillis,
    endTimeMillis,
  };

  try {
    const { data } = await axios.post(DATASET_URL, body, { headers });
    const { bucket } = data;
    const count = parseSteps(bucket);

    return count;
  } catch (err) {
    if (!axios.isAxiosError(err)) {
      throw createError(INTERNAL_SERVER_ERROR);
    }

    if (err.response.status === UNAUTHORIZED) {
      throw createError(UNAUTHORIZED);
    }

    throw createError(INTERNAL_SERVER_ERROR, ERROR.GOOGLE_API_NOT_AVAILABLE);
  }
}

async function updateModels({ sleeps, activities, steps }, userId) {
  try {
    const activitiesPromises = activities.map((activity) => Activity.findOrCreate(({ userId, ...activity })));
    const sleepsPromises = sleeps.map((sleep) => Sleep.findOrCreate(({ userId, ...sleep })));
    const { date, count } = steps.pop();

    await Promise.all(sleepsPromises);
    await Promise.all(activitiesPromises);
    await Step.findOneAndUpdate({ userId }, { date, count }, { upsert: true });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      throw createError(BAD_REQUEST, ERROR.INVALID_VALUE);
    }

    throw err;
  }
}

module.exports = {
  getGoogleFitSessionData,
  getGoogleFitStepData,
  updateModels,
};
