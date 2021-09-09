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
const { count } = require("../../models/Meal");
const { prototype } = require("aws-sdk/clients/acm");

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
  const customCategories = user.customCategories;
  const creator = user._id;
  const today = new Date();
  const { pastMidnight, pastAWeekAgo, pastAMonthAgo } = getPastISOTime(today);

  const a = await Step.findOne({ userId: creator, date: pastMidnight });

  console.log(customCategories);

  const hexData = await Activity.aggregate([
    { $lookup: {
      from: "Meal", // other table name
      localField: "rating.heartCount", // name of users table field
      foreignField: "rating.heartCount", // name of userinfo table field
      as: "Activity+Meal",
    } },
    { $unwind: "$Activity+Meal" },
    { $match: {
      userId: creator,
      startTime: {
        $gte: new Date("2021-08-30T13:04:00.000+00:00"), //pastAMonthAgo,
        $lte: new Date("2021-09-07T13:32:47.000+00:00"), //pastMidnight,
      },
    } }, { $group: {
      _id: "$startTime",
      average: { $avg: "$rating.heartCount" },
    } }, { $sort: { _id: -1 } },
  ]);

  const lineDataPipe = [
    { $match: {
      userId: creator,
      startTime: {
        $gte: new Date("2021-08-30T13:04:00.000+00:00"), //pastAWeekAgo,
        $lte: new Date("2021-09-07T13:32:47.000+00:00"), //pastMidnight,
      },
    } }, { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
      average: { $avg: "$rating.heartCount" },
    } }, { $sort: { _id: -1 } },
  ];

  // const AlbumLineDataPipe = [
  //   { $match: {
  //     userId: creator,
  //     category: "냠냠",
  //     startTime: {
  //       $gte: new Date("2021-08-30T13:04:00.000+00:00"), //pastAWeekAgo,
  //       $lte: new Date("2021-09-07T13:32:47.000+00:00"), //pastMidnight,
  //     },
  //   } }, { $group: {
  //     _id: "$startTime",
  //     average: { $avg: "$rating.heartCount" },
  //   } }, { $sort: { _id: -1 } },
  // ];

  try {
    const activityLineData = await Activity.aggregate(lineDataPipe).exec();
    // const mealLineData = await Meal.aggregate(lineDataPipe).exec();
    // const sleepLineData = await Sleep.aggregate(lineDataPipe).exec();
    // const albumLineData = await Album.aggregate(AlbumLineDataPipe).exec();
    // const gridLineData = await Grid.aggregate(GridLineDataPipe).exec();

    res.status(OK);
    res.json({
      count,
      activityLineData,
      // mealLineData,
      // sleepLineData,
      // albumLineData,
      // gridLineData,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postLogin, postRefresh, getCondition };
