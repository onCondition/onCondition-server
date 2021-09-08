const express = require("express");
const router = express.Router();
const albumController = require("../controller/customAlbum");
const requiresLogin = require("../middleware/requiresLogin");

router.get("/:category/", requiresLogin, albumController.getAlbum);

router.post("/:category/", albumController.postAlbum);

router.get("/:category/:id", albumController.getAlbumDetail);

router.patch("/:category/:id", albumController.patchAlbumDetail);

router.delete("/:category/:id", albumController.deleteAlbumDetail);

module.exports = router;
