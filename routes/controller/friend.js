const createError = require("http-errors");
const mongoose = require("mongoose");

const User = require("../../models/User");
const ACCESS_LEVELS = require("../../constants/accessLevels");
const { ERROR } = require("../../constants/messages");
const {
  OK, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST,
} = require("../../constants/statusCodes");

async function getFriends(req, res, next) {
  //
}

async function sendFriendRequest(req, res, next) {
  //
}

async function patchFriendDetail(req, res, next) {
  //
}

async function deleteFriendDetail(req, res, next) {
  const { creator } = req;
  const { id: friendId } = req.params;

  try {
    if (req.accessLevel !== ACCESS_LEVELS.CREATOR) {
      throw createError(UNAUTHORIZED);
    }

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_FRIEND_ID);
    }

    const senderResult = await User.findByIdAndUpdate(creator, {
      $pull: { friends: mongoose.Types.ObjectId(friendId) },
    });

    if (!senderResult) {
      throw createError(NOT_FOUND, ERROR.ALREADY_NOT_FRIEND);
    }

    const receiverResult = await User.findByIdAndUpdate(friendId, {
      $pull: { friends: mongoose.Types.ObjectId(creator) },
    });

    if (!receiverResult) {
      throw createError(NOT_FOUND, ERROR.ALREADY_NOT_FRIEND);
    }

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getFriends,
  sendFriendRequest,
  patchFriendDetail,
  deleteFriendDetail,
};
