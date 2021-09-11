const express = require("express");
const router = express.Router();
const friendController = require("../controller/friend");

router.get("/", friendController.getFriends);

router.post("/new", friendController.sendFriendRequest);

router.patch("/:id", friendController.patchFriendDetail);

router.delete("/:id", friendController.deleteFriendDetail);

module.exports = router;
