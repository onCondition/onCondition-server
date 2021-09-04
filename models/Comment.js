const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [ "meal", "activity", "sleep", "custom-grape", "custom-album"],
  },
  ratingId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "category",
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(commentSchema);
