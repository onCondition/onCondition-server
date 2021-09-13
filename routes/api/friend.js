const express = require("express");
const router = express.Router();
const friendController = require("../controller/friend");
const indexController = require("../controller/index");

router.get("/", friendController.getFriends);

router.get("/:id", indexController.getProfile);

router.post("/new", friendController.sendFriendRequest);

router.patch("/:id", friendController.patchFriendDetail);

router.delete("/:id", friendController.deleteFriendDetail);

module.exports = router;
