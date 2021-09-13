require("dotenv").config();
require("./config/db");

const express = require("express");
const logger = require("morgan");
const { handleNotFound, handleDefaultError } = require("./errorHandler");

const app = express();

const setAccessLevel = require("./routes/middleware/setAccessLevel");
const verifyCustomCategory = require("./routes/middleware/verifyCustomCategory");
const login = require("./routes/api/login");
const index = require("./routes/api/index");
const meal = require("./routes/api/meal");
const sleep = require("./routes/api/sleep");
const activity = require("./routes/api/activity");
const customGrid = require("./routes/api/customGrid");
const customAlbum = require("./routes/api/customAlbum");
const comment = require("./routes/api/comment");
const preference = require("./routes/api/preference");
const friend = require("./routes/api/friend");
const image = require("./routes/api/image");
const googleFit = require("./routes/api/googleFit");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", login);
app.use("/:creatorId/", setAccessLevel, index);
app.use(/.*\/meal/, meal);
app.use(/.*\/activity/, activity);
app.use(/.*\/sleep/, sleep);
app.use(/.*\/preference/, preference);
app.use(/.*\/friends/, friend);
app.use(/.*\/googleFit/, googleFit);
app.use(/.*\/image/, image);
app.use("/:creatorId/:category/:ratingId/comment", comment);
app.use("/:creatorId/:category", verifyCustomCategory, customGrid, customAlbum);

app.use(handleNotFound);
app.use(handleDefaultError);

module.exports = app;
