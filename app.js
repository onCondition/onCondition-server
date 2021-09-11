require("dotenv").config();
require("./config/db");

const express = require("express");
const logger = require("morgan");
const { handleNotFound, handleDefaultError } = require("./errorHandler");

const app = express();

const index = require("./routes/api/index");
const meal = require("./routes/api/meal");
const sleep = require("./routes/api/sleep");
const image = require("./routes/api/image");
const comment = require("./routes/api/comment");
const activity = require("./routes/api/activity");
const googleFit = require("./routes/api/googleFit");
const preference = require("./routes/api/preference");
const customGrid = require("./routes/api/customGrid");
const customAlbum = require("./routes/api/customAlbum");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", index);
app.use("/meal", meal);
app.use("/sleep", sleep);
app.use("/image", image);
app.use("/comments", comment);
app.use("/activity", activity);
app.use("/googleFit", googleFit);
app.use("/preference", preference);
app.use("/customGrid", customGrid);
app.use("/customAlbum", customAlbum);

app.use(handleNotFound);
app.use(handleDefaultError);

module.exports = app;
