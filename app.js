require("dotenv").config();
require("./config/db");

const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();

const setAccessLevel = require("./routes/middleware/setAccessLevel");
const verifyCustomCategory = require("./routes/middleware/verifyCustomCategory");
const login = require("./routes/api/login");
const condition = require("./routes/api/condition");
const meal = require("./routes/api/meal");
const sleep = require("./routes/api/sleep");
const activity = require("./routes/api/activity");
const customGrid = require("./routes/api/customGrid");
const customAlbum = require("./routes/api/customAlbum");
const comment = require("./routes/api/comment");
const preference = require("./routes/api/preference");
const friend = require("./routes/api/friend");
const googleFit = require("./routes/api/googleFit");
const { handleNotFound, handleDefaultError } = require("./errorHandler");

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/", login);
app.use("/:creatorId/", setAccessLevel, condition);
app.use(/.*\/meal/, meal);
app.use(/.*\/activity/, activity);
app.use(/.*\/sleep/, sleep);
app.use(/.*\/preference/, preference);
app.use(/.*\/friend/, friend);
app.use(/.*\/googleFit/, googleFit);
app.use("/:creatorId/:category/:ratingId/comment", comment);
app.use("/:creatorId/:category", verifyCustomCategory, customGrid, customAlbum);

app.use(handleNotFound);
app.use(handleDefaultError);

module.exports = app;
