const createError = require("http-errors");

const { ERROR } = require("../../constants/messages");
const { BAD_REQUEST } = require("../../constants/statusCodes");

function isValidUrl(string) {
  let url = null;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function isValidDate(string) {
  const date = new Date(string);

  return !isNaN(date.getTime());
}

function isValidHeartCount(heartCount) {
  const min = 0;
  const max = 10;

  return heartCount >= min && heartCount <= max;
}

function isValidText(text) {
  return typeof text === "string";
}

function validateBody({
  url,
  date,
  heartCount,
  text,
}) {
  if (url && !isValidUrl(url)) {
    throw createError(BAD_REQUEST, ERROR.INVALID_URL);
  }

  if (!isValidDate(date)) {
    throw createError(BAD_REQUEST, ERROR.INVALID_DATE);
  }

  if (!isValidHeartCount(heartCount)) {
    throw createError(BAD_REQUEST, ERROR.INVALID_HEART_COUNT);
  }

  if (text && !isValidText(text)) {
    throw createError(BAD_REQUEST, ERROR.INVALID_RATING_TEXT);
  }
}

module.exports = {
  isValidUrl,
  isValidDate,
  isValidHeartCount,
  isValidText,
  validateBody,
};
