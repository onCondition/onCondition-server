const mongoose = require("mongoose");
const createError = require("http-errors");

const User = require("../../models/User");
const Activity = require("../../models/Activity");
const Sleep = require("../../models/Sleep");
const Meal = require("../../models/Meal");
const Album = require("../../models/CustomAlbum");
const Grid = require("../../models/CustomGrid");

const getPastISOTime = require("../utils/getPastISOTime");
const ACCESS_LEVELS = require("../../constants/accessLevels");
const { OK, UNAUTHORIZED, NOT_FOUND } = require("../../constants/statusCodes");
const { generateToken, verifyToken } = require("../utils/tokens");

async function getCondition(req, res, next) {
  try {
    if (req.accessLevel !== ACCESS_LEVELS.CREATOR) {
      throw createError(UNAUTHORIZED);
    }
    const creator = mongoose.Types.ObjectId(req.userId);
    const today = new Date();
    const { pastMidnight, pastAMonthAgo } = getPastISOTime(today);

    const dataPipeLine = [
      {
        $match: {
          creator,
          date: {
            $gte: pastAMonthAgo,
            $lte: pastMidnight,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
          average: {
            $avg: "$rating.heartCount",
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ];

    const customDataPipeLine = [
      {
        $match: {
          creator,
          date: {
            $gte: pastAMonthAgo,
            $lte: pastMidnight,
          },
        },
      },
      {
        $group: {
          _id: {
            category: "$category",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date",
              },
            },
          },
          score: {
            $avg: "$rating.heartCount",
          },
        },
      },
      {
        $group: {
          _id: "$_id.category",
          data: {
            $push: {
              _id: "$_id.date",
              average: "$score",
            },
          },
        },
      },
    ];

    const activityData = await Activity.aggregate(dataPipeLine);
    const mealData = await Meal.aggregate(dataPipeLine);
    const sleepData = await Sleep.aggregate(dataPipeLine);
    const albumData = await Album.aggregate(customDataPipeLine);
    const gridData = await Grid.aggregate(customDataPipeLine);

    res.status(OK);
    res.json({
      activityData,
      mealData,
      sleepData,
      albumData,
      gridData,
    });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const creator = mongoose.Types.ObjectId(req.userId);
    const user = await User.findById(creator);

    if (!user) {
      next(createError(NOT_FOUND));
    }

    const { stroke, scores, lastAccessDate } = user;
    const now = new Date();
    const { pastAMonthAgo } = getPastISOTime(now);

    const matchOption = { creator, date: { $gte: pastAMonthAgo, $lte: now } };

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
      data,
    });
  } catch (err) {
    next(err);
  }
}

function postRefresh(req, res, next) {
  const { token: refreshToken } = req.headers;

  try {
    const { userId } = verifyToken(refreshToken, true);
    const accessToken = generateToken(userId);

    res.status(OK);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCondition, getProfile, postRefresh };
