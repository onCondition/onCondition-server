const mongoose = require("mongoose");

function setCreator(req, res, next) {
  const { creator } = req.params;

  if (mongoose.Types.ObjectId.isValid(creator)) {
    req.creator = creator;
  }

  next();
}

module.exports = setCreator;
