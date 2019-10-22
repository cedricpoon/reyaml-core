function pureInsert({ key, jsSource, jsNew }) {
  jsSource
    .filter(item => item != null)
    .map(item => Object.keys(item).filter(k => k == key).map(k => Object.assign(item[k], jsNew)));
  return jsSource;
}

module.exports = { insert: pureInsert };
