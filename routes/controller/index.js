const mongoose = require("mongoose");

const createError = require("http-errors");
const firebase = require("../../config/firebase");

const User = require("../../models/User");
const Step = require("../../models/Step");
const Activity = require("../../models/Activity");
const Sleep = require("../../models/Sleep");
const Meal = require("../../models/Meal");
const Album = require("../../models/CustomAlbum");
const Grid = require("../../models/CustomGrid");

const getPastISOTime = require("../utils/getPastISOTime");
const { ERROR } = require("../../constants/messages");
const { OK, BAD_REQUEST } = require("../../constants/statusCodes");
const { generateToken, verifyToken } = require("../utils/tokens");

const {
  validateBody, isValidUrl, isValidHeartCount, isValidText, isValidDate,
} = require("../utils/validations");

async function postLogin(req, res, next) {
  const { token: idToken } = req.headers;

  try {
    const {
      uid, name, picture: profileUrl,
    } = await firebase.auth().verifyIdToken(idToken);
    const { doc: user } = await User.findOrCreate({
      uid, name, profileUrl,
    });

    const accessToken = generateToken(user._id);
    const refreshToken = generateToken(user._id, true);

    res.status(OK);
    res.json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(createError(BAD_REQUEST, ERROR.INVALID_TOKEN));
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

async function getCondition(req, res, next) {
  const user = await User.findOne(req.params.id);
  const creator = user._id;
  const today = new Date();
  const { pastMidnight, pastAMonthAgo } = getPastISOTime(today);

  const dataPipeLine = [
    { $match: {
      creator,
      date: {
        $gte: pastAMonthAgo,
        $lte: pastMidnight,
      },
    } }, { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      average: { $avg: "$rating.heartCount" },
    } }, { $sort: { _id: -1 } },
  ];

  const customDataPipeLine = [
    { $match: {
      creator,
      date: {
        $gte: pastAMonthAgo,
        $lte: pastMidnight,
      },
    } }, {
      $group: {
        _id: { category: "$category", date: "$date" },
        score: { $avg: "$rating.heartCount" },
      },
    }, {
      $group: {
        _id: "$_id.category",
        data: {
          $push: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$_id.date",
              },
            },
            average: { $avg: "$score" },
          },
        },
      },
    }];

  try {
    const step = await Step.findOne({ userId: creator,
      date: pastMidnight });
    const activityData = await Activity.aggregate(dataPipeLine).exec();
    const mealData = await Meal.aggregate(dataPipeLine).exec();
    const sleepData = await Sleep.aggregate(dataPipeLine).exec();
    const albumData = await Album.aggregate(customDataPipeLine).exec();
    const gridData = await Grid.aggregate(customDataPipeLine).exec();

    const stepData = (!step) ? 0 : step.count;

    res.status(OK);
    res.json({
      stepData,
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

module.exports = { postLogin, postRefresh, getCondition };
