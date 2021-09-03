const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  date: {
    type: Date,
  },
  heartCount: {
    type: Number,
  },
  text: {
    type: String,
  }
});

const customSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
  },
  date: {
    type: Date,
  },
  rating: ratingSchema,
});

module.exports = mongoose.model("Custom", customSchema);
