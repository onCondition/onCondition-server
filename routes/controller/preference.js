const createError = require("http-errors");
const User = require("../../models/User");
const CustomGrid = require("../../models/CustomGrid");
const CustomAlbum = require("../../models/CustomAlbum");
const Comments = require("../../models/Comments");
const { ERROR } = require("../../constants/messages");
const { STATUS } = require("../../constants/statusCodes");
const NUMBERS = require("../../constants/numbers");

const { validateBody, isValidText } = require("../utils/validations");

async function deleteCategory(req, res, next) {
  //
}

async function addCategory(req, res, next) {
  //
}

async function getNewGoogleFitData(req, res, next) {
  //
}

module.exports = { deleteCategory, addCategory, getNewGoogleFitData };
