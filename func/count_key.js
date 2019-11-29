function count ({ sourceObj }) {
  const rc = obj => typeof obj === 'object' ? Object.keys(obj).reduce((acc, curr) => {
    if (Array.isArray(obj)) return acc + rc(obj[curr])
    else if (typeof obj[curr] === 'object') return ++acc + rc(obj[curr])
    else return ++acc
  }, 0) : 0;

  return rc(sourceObj);
}

module.exports = { count_key: count };
