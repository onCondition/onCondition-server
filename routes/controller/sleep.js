const createError = require("http-errors");
const mongoose = require("mongoose");

const Sleep = require("../../models/Sleep");
const User = require("../../models/User");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../../constants/statusCodes");

const {
  validateBody, isValidUrl, isValidHeartCount, isValidText, isValidDate,
} = require("../utils/validations");

async function getSleep(req, res, next) {
  //
}

async function getSleepDetail(req, res, next) {
  //
}

async function patchSleepDetail(req, res, next) {
  //
}

async function deleteSleepDetail(req, res, next) {
  //
}

module.exports = {
  getSleep, getSleepDetail, patchSleepDetail, deleteSleepDetail,
};
