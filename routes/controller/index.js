function sendOk(req, res, next) {
  res.status(200)
  res.json({ result: 'ok' });
};

module.exports = { sendOk };
