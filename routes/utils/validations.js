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

function isValidDate(date) {
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

function validateBody(entries) {
  const errors = [];

  entries.forEach(([value, validate]) => {
    if (!validate(value)) {
      errors.push(value);
    }
  });

  return errors.join(", ");
}

module.exports = {
  isValidUrl,
  isValidDate,
  isValidHeartCount,
  isValidText,
  validateBody,
};
