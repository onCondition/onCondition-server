require("dotenv").config();
require("./config/db");

const express = require("express");
const logger = require("morgan");
const { handleNotFound, handleDefaultError } = require("./errorHandler");

const app = express();

const index = require("./routes/api/index");
const meal = require("./routes/api/meal");
const activity = require("./routes/api/activity");
const customGrid = require("./routes/api/customGrid");
const customAlbum = require("./routes/api/customAlbum");
const comment = require("./routes/api/comment");
const preference = require("./routes/api/preference");
const image = require("./routes/api/image");
const googleFit = require("./routes/api/googleFit");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", index);
app.use("/meal", meal);
app.use("/activity", activity);
app.use("/customGrid", customGrid);
app.use("/customAlbum", customAlbum);
app.use("/comments", comment);
app.use("/preference", preference);
app.use("/image", image);
app.use("/googleFit", googleFit);

app.use(handleNotFound);
app.use(handleDefaultError);

module.exports = app;
