const createError = require("http-errors");
const mongoose = require("mongoose");

const User = require("../../models/User");
const Activity = require("../../models/Activity");
const Sleep = require("../../models/Sleep");
const Meal = require("../../models/Meal");
const Album = require("../../models/CustomAlbum");
const Grid = require("../../models/CustomGrid");

const getPastISOTime = require("../utils/getPastISOTime");
const ACCESS_LEVELS = require("../../constants/accessLevels");
const { ERROR } = require("../../constants/messages");
const {
  OK, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST,
} = require("../../constants/statusCodes");

async function getFriends(req, res, next) {
  //
}

async function getProfile(req, res, next) {
  try {
    const { creator } = req;

    if (req.accessLevel !== ACCESS_LEVELS.CREATOR) {
      throw createError(UNAUTHORIZED);
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw createError(BAD_REQUEST, ERROR.INVALID_FRIEND_ID);
    }

    const friendId = mongoose.Types.ObjectId(req.params.id);

    if (!creator.friends.includes(friendId)) {
      throw createError(UNAUTHORIZED);
    }

    const friend = await User.findById(friendId);

    if (!friend) {
      next(createError(NOT_FOUND));
    }

    const {
      stroke, scores, lastAccessDate, profileUrl, name,
    } = friend;
    const now = new Date();
    const { pastAMonthAgo } = getPastISOTime(now);

    const matchOption = {
      creator: friendId,
      date: { $gte: pastAMonthAgo, $lte: now },
    };

    const activity = Activity.aggregate([{ $match: matchOption }, { $addFields: { category: "activity" } }]);
    const meal = Meal.aggregate([{ $match: matchOption }, { $addFields: { category: "meal" } }]);
    const sleep = Sleep.aggregate([{ $match: matchOption }, { $addFields: { category: "sleep" } }]);
    const album = Album.aggregate([{ $match: matchOption }, { $addFields: { type: "album" } }]);
    const grid = Grid.aggregate([{ $match: matchOption }, { $addFields: { type: "grid" } }]);

    const recentDataPerModel = await Promise.all([
      activity, meal, sleep, album, grid,
    ]);

    const data = recentDataPerModel.reduce((data, dataPerModel) => {
      return data.concat(dataPerModel);
    }, []).sort((a, b) => b.date - a.date);

    res.status(OK);
    res.json({
      stroke,
      scores,
      lastAccessDate,
      profileUrl,
      name,
      data,
    });
  } catch (err) {
    next(err);
  }
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

    const senderResult = await User.findByIdAndUpdate(creator.id, {
      $pull: { friends: mongoose.Types.ObjectId(friendId) },
    });

    if (!senderResult) {
      throw createError(NOT_FOUND, ERROR.ALREADY_NOT_FRIEND);
    }

    const receiverResult = await User.findByIdAndUpdate(friendId, {
      $pull: { friends: mongoose.Types.ObjectId(creator.id) },
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
  getProfile,
  sendFriendRequest,
  patchFriendDetail,
  deleteFriendDetail,
};
