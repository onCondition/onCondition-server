const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = require("../../config/AWS");
const requiresLogin = require("../middleware/requiresLogin");

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "on-condition",
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      cb(null, `album1/${Date.now()}`);
    },
  }),
});

router.post(
  "/",
  requiresLogin,
  upload.single("image"),
  function (req, res, next) {
    res.json({ result: "ok", imageUrl: req.file.location });
  },
);

module.exports = router;
