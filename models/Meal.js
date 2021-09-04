const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ratingSchema = require("./subDocs/ratingSchema");
const { isValidUrl } = require("../routes/utils/validations");
const { ERROR } = require("../constants/messages");

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: "hashed",
  },
  url: {
    type: String,
    validate: [ isValidUrl, ERROR.INVALID_URL],
  },
  date: {
    type: Date,
    required: true,
  },
  rating: {
    type: ratingSchema,
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
});

mealSchema.path("_id");
mealSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Meal", mealSchema);
