const createError = require("http-errors");
const mongoose = require("mongoose");

const Grid = require("../../models/CustomGrid");
const User = require("../../models/User");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../../constants/statusCodes");

const {
  validateBody, isValidUrl, isValidHeartCount, isValidText, isValidDate,
} = require("../utils/validations");

async function getGrid(req, res, next) {
  //
}

async function postGrid(req, res, next) {
  //
}

async function getGridDetail(req, res, next) {
  //
}

async function patchGridDetail(req, res, next) {
  //
}

async function deleteGridDetail(req, res, next) {
  //
}

module.exports = {
  getGrid,
  postGrid,
  getGridDetail,
  patchGridDetail,
  deleteGridDetail,
};
