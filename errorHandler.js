const createError = require('http-errors');

exports.handleNotFound = function (req, res, next) {
  next(createError(404));
};

exports.handleDefaultError = function (err, req, res, next) {
  const message = req.app.get('env') === 'development' ? err.message : 'Internal Server Error';

  // render the error page
  res.status(err.status || 500)
  res.json({ error: message });
};
