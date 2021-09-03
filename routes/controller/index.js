const User = require("../../models/User");
const { ERROR } = require("../../constants/messages");

async function postLogin(req, res, next) {
  res.status(200);
  res.json({ result: 'ok' });
};

async function postLogout(req, res, next) {

};

async function getCondition(req, res, next) {

};

module.exports = { postLogin, postLogout, getCondition };
