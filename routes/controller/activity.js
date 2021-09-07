const createError = require("http-errors");
const mongoose = require("mongoose");

const Activity = require("../../models/Activity");
const User = require("../../models/User");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../../constants/statusCodes");

const {
  validateBody, isValidUrl, isValidHeartCount, isValidText, isValidDate,
} = require("../utils/validations");

async function getActivity(req, res, next) {
  //
}

async function getActivityDetail(req, res, next) {
  //
}

async function patchActivityDetail(req, res, next) {
  //
}

async function deleteActivityDetail(req, res, next) {
  //
}

module.exports = {
  getActivity,
  getActivityDetail,
  patchActivityDetail,
  deleteActivityDetail,
};
