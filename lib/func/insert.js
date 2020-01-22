function pureInsert({ key, jsSource, jsNew }) {
  const traverser = item => Object.keys(item).filter(k => k == key).map(k => Object.assign(item[k], jsNew));
  if (Array.isArray(jsSource))
    jsSource
      .filter(item => item != null)
      .map(traverser);
  else
    traverser(jsSource);
  return jsSource;
}

module.exports = { insert: pureInsert };
