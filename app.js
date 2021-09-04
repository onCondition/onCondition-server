require("dotenv").config();
require("./config/db");

const express = require("express");
const logger = require("morgan");
const { handleNotFound, handleDefaultError } = require("./errorHandler");

const app = express();

const index = require("./routes/api/index");
const meal = require("./routes/api/meal");
const preference = require("./routes/api/preference");

app.use(logger("dev"));
app.use(express.json());

app.use("/", index);
app.use("/meal", meal);
app.use("/preference", preference);

app.use(handleNotFound);
app.use(handleDefaultError);

module.exports = app;
