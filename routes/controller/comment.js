const { OK } = require("../../constants/statusCodes");

function postComment(req, res, next) {
  try {
    res.status(OK);
    res.json({ result: "ok", category: req.category });
  } catch (err) {
    next(err);
  }
}

function patchComment() {
  //
}

function deleteComment() {
  //
}

module.exports = { postComment, patchComment, deleteComment };
