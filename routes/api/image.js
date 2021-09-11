const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = require("../../config/AWS");
const ACCESS_LEVELS = require("../../constants/accessLevels");
const { UNAUTHORIZED } = require("../../constants/statusCodes");

function checkAccessRange(req, res, next) {
  if (req.accessLevel !== ACCESS_LEVELS.CREATOR) {
    return next(createError(UNAUTHORIZED));
  }

  next();
}

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
  checkAccessRange,
  upload.single("image"),
  function (req, res, next) {
    res.json({ result: "ok", imageUrl: req.file.location });
  },
);

module.exports = router;
