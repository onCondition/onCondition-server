const mongoose = require("mongoose");
const { generateToken } = require("../routes/utils/tokens");

const mockUserId = "613c79ac13010b7f24663718";
const mockActivityId = "613c79ac13010b7f24663711";
const mockToken = generateToken(mockUserId);

const mockUser = {
  _id: mongoose.Types.ObjectId(mockUserId),
  uid: "mock uid",
  profileUrl: "mock profile",
  name: "mock user",
};

const mockActivity = {
  _id: mongoose.Types.ObjectId(mockActivityId),
  creator: mongoose.Types.ObjectId(mockUserId),
  sessionId: "AA-BB-CC",
  duration: 1,
  date: new Date(),
  type: "Walking",
  comments: [],
};

const mockStep = {
  creator: mockUserId,
  date: new Date(),
  count: 1000,
};

module.exports = {
  mockToken,
  mockUserId,
  mockUser,
  mockActivityId,
  mockActivity,
  mockStep,
};
