function setCategory(req, res, next) {
  const { category } = req.params;
  req.category = category;

  next();
}

module.exports = setCategory;
