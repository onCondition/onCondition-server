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

    const setDateRange = {
      $match: {
        creator,
        date: { $gte: pastAMonthAgo, $lte: pastMidnight },
      },
    };
    const groupByDate = {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        average: { $avg: "$rating.heartCount" },
      },
    };
    const sortByDate = { $sort: { _id: -1 } };
    const caculateTotalAverage = {
      $group: {
        _id: null,
        average: { $avg: "$average" },
        data: { $push: "$$ROOT" },
      },
    };
    const defaulDataPipeLine = [
      setDateRange,
      groupByDate,
      sortByDate,
      caculateTotalAverage,
    ];

    const groupByDateAndCategory = {
      $group: {
        _id: {
          category: "$category",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        },
        score: { $avg: "$rating.heartCount" },
      },
    };
    const sortByDateBeforePush = { $sort: { "_id.date": -1 } };
    const groupByCategory = {
      $group: {
        _id: "$_id.category",
        average: { $avg: "$score" },
        data: { $push: { _id: "$_id.date", average: "$score" } },
      },
    };

    const customDataPipeLine = [
      groupByDateAndCategory,
      sortByDateBeforePush,
      groupByCategory,
    ];

    const [activity, meal, sleep, album, grid] = await Promise.all([
      Activity.aggregate(defaulDataPipeLine),
      Meal.aggregate(defaulDataPipeLine),
      Sleep.aggregate(defaulDataPipeLine),
      Album.aggregate(customDataPipeLine),
      Grid.aggregate(customDataPipeLine),
    ]);

    const { average: activityScore, data: activityData } = activity[0] || {};
    const { average: mealScore, data: mealData } = meal[0] || {};
    const { average: sleepScore, data: sleepData } = sleep[0] || {};
    const { averages: customScores, datas: customDatas } = [...album, ...grid]
      .reduce(({ averages, datas }, { _id: category, average, data }) => {
        return {
          averages: { ...averages, [category]: average },
          datas: { ...datas, [category]: data },
        };
      }, { averages: {}, datas: {} }) || {};

    const scores = {
      activity: activityScore || 0,
      meal: mealScore || 0,
      sleep: sleepScore || 0,
      ...customScores,
    };

    await User.findByIdAndUpdate(creator, { scores });

    const data = {
      activity: activityData || [],
      meal: mealData || [],
      sleep: sleepData || [],
      ...customDatas,
    };

    res.status(OK);
    res.json({ result: "ok", data });
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
