const createError = require("http-errors");
const mongoose = require("mongoose");

const User = require("../../models/User");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../../constants/statusCodes");

async function getFriend(req, res, next) {
  //
}

async function sendFriendRequest(req, res, next) {
  //
}

async function patchFriendDetail(req, res, next) {
  //
}

async function deleteFriendDetail(req, res, next) {
  //
}

module.exports = {
  getFriend,
  sendFriendRequest,
  patchFriendDetail,
  deleteFriendDetail,
};
