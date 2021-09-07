const createError = require("http-errors");
const mongoose = require("mongoose");

const Album = require("../../models/CustomAlbum");
const User = require("../../models/User");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../../constants/statusCodes");

const {
  validateBody, isValidUrl, isValidHeartCount, isValidText, isValidDate,
} = require("../utils/validations");

async function getAlbum(req, res, next) {
  //
}

async function postAlbum(req, res, next) {
  //
}

async function getAlbumDetail(req, res, next) {
  //
}

async function patchAlbumDetail(req, res, next) {
  //
}

async function deleteAlbumDetail(req, res, next) {
  //
}

module.exports = {
  getAlbum,
  postAlbum,
  getAlbumDetail,
  patchAlbumDetail,
  deleteAlbumDetail,
};
