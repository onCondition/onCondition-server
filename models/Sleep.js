const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ratingSchema = require("./subDocuments/Rating");
const { ERROR } = require("../constants/messages");

const sleepSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: "hashed",
  },
  sessionId: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
  },
  rating: ratingSchema,
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
});

sleepSchema.path("_id");
sleepSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Sleep", sleepSchema);
