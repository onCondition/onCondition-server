const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ratingSchema = require("./subDocuments/Rating");

const activitySchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: "hashed",
  },
  sessionId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
  },
  type: {
    type: String,
    required: true,
  },
  rating: ratingSchema,
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
});

activitySchema.path("_id");
activitySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Activity", activitySchema);
