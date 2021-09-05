const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: new Date(),
  },
  heartCount: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    default: "",
  },
});

module.exports = ratingSchema;
