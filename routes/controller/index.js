const User = require("../../models/User");
const { ERROR } = require("../../constants/messages");
const { OK } = require("../../constants/statusCodes");

function postLogin(req, res, next) {
  res.status(OK);
  res.json({ result: "ok" });
}

async function postLogout(req, res, next) {
  //
}

async function getCondition(req, res, next) {
  //
}

module.exports = {
  postLogin, postLogout, getCondition,
};
