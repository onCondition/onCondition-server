const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { ERROR } = require("../constants/messages");

const stepSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: "hashed",
  },
  date: {
    type: Date,
    required: true,
  },
  count: {
    type: Number,
  },
});

stepSchema.path("_id");
stepSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Step", stepSchema);
