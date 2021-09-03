const express = require('express');
const router = express.Router();
const { sendOk } = require('../controller/index');

router.get('/', sendOk);

module.exports = router;
