const mongoose = require("mongoose");
const ratingSchema = require("../models/subDocuments/ratingSchema");

const customGridSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
  },
  comments: {
    type: Array,
  },
  rating: ratingSchema,
});

module.exports = mongoose.model("CustomGrape", customGridSchema);
