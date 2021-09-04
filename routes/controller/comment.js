const Comment = require("../../models/Comment");
const Meal = require("../../models/Meal");
const { OK } = require("../../constants/statusCodes");

async function postComment(req, res, next) {
  try {
    //mock comment
    const newComment = await Comment.create({
      category: "meal",
      ratingId: "6133659530e64e9a37b9c92b",
      creator: "6133294e0f3e1e91446fcc8c",
      date: new Date(),
      content: "asd",
    });

    await Meal.findByIdAndUpdate("6133659530e64e9a37b9c92b", {
      $push: { comments: newComment._id }
    });

    res.status(OK);
    res.json({ result: "ok" });
  } catch (err) {
    next(err);
  }
}

function patchComment() {
  //
}

function deleteComment() {
  //
}

module.exports = { postComment, patchComment, deleteComment };
