const count = obj => obj != null ? Object.keys(obj).reduce((acc, curr) => {
  if (Array.isArray(obj)) return count(obj[curr])
  else if (typeof obj[curr] === 'object') return ++acc + count(obj[curr])
  else return ++acc
}, 0) : 0;

module.exports = { count_key: count };
