const createError = require("http-errors");
const mongoose = require("mongoose");

const User = require("../../models/User");
const Request = require("../../models/Request");
const ACCESS_LEVELS = require("../../constants/accessLevels");
const { ERROR } = require("../../constants/messages");
const {
  OK, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST, INTERNAL_SERVER_ERROR,
} = require("../../constants/statusCodes");

async function getFriends(req, res, next) {
  try {
    const { creator } = mongoose.Types.ObjectId(req.creator.id);
    const friends = await User.findById(creator).populate("friends",
      "_id name profileUrl stroke scores lastAccessDate").exec();

    const receivedRequests = await Request.find({
      receiverId: creator,
    });

    const sentRequests = await Request.find({
      senderId: creator,
    });

    res.status(OK);
    res.json({
      result: "ok",
      friends,
      receivedRequests,
      sentRequests,
    });
  } catch (err) {
    next();
  }
}

async function sendFriendRequest(req, res, next) {
  try {
    const { creator } = req.creator.id;
    const { friendId } = req.body;

    if (req.accessLevel !== ACCESS_LEVELS.CREATOR) {
      throw createError(UNAUTHORIZED);
    }

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_FRIEND_ID);
    }

    const prevRequest = await Request.findOne({
      receiverId: mongoose.Types.ObjectId(friendId),
      senderId: mongoose.Types.ObjectId(creator),
    });

    if (prevRequest) {
      throw createError(BAD_REQUEST, ERROR.INVALID_FRIEND_REQUEST);
    }

    const request = await Request.create({
      receiverId: mongoose.Types.ObjectId(friendId),
      senderId: mongoose.Types.ObjectId(creator),
    });

    if (!request) {
      throw createError(INTERNAL_SERVER_ERROR,
        ERROR.UNCLEAR_FINISHED_ADD_FRIEND);
    }

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    next(err);
  }
}

async function patchFriendDetail(req, res, next) {
  try {
    const { creator } = req.creator.id;
    const { id: friendId } = req.params;
    const { isAccepted } = req.body.isAccepted;

    if (req.accessLevel !== ACCESS_LEVELS.CREATOR) {
      throw createError(UNAUTHORIZED);
    }

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_FRIEND_ID);
    }

    const request = await Request.find({
      receiverId: mongoose.Types.ObjectId(creator),
      senderId: mongoose.Types.ObjectId(friendId),
    });

    if (!request) {
      throw createError(BAD_REQUEST, ERROR.INVALID_FRIEND_REQUEST);
    }

    if (isAccepted) {
      const receiverResult = User.findByIdAndUpdate(creator, {
        $push: { friends: mongoose.Types.ObjectId(friendId) },
      });

      const senderResult = User.findByIdAndUpdate(friendId, {
        $push: { friends: mongoose.Types.ObjectId(creator) },
      });

      if (!receiverResult || !senderResult) {
        throw createError(INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR);
      }
    }

    const deleteRequest = Request.findByIdAndDelete(request._id);

    if (!deleteRequest) {
      throw createError(INTERNAL_SERVER_ERROR,
        ERROR.UNCLEAR_FINISHED_ADD_FRIEND);
    }

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    next(err);
  }
}

async function deleteFriendDetail(req, res, next) {
  const { creator } = req.creator.id;
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
