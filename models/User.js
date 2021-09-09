const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  profileUrl: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  lastAccessDate: {
    type: Date,
  },
  stroke: {
    type: Number,
  },
  scores: {
    type: Array,
  },
  friends: {
    type: Array,
  },
  customCategories: {
    type: Array,
  },
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);
