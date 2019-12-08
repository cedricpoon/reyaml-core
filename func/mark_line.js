const { marker, markerMap } = require('../config.js');
const traverse = require('../utils/traverse');

function appendAsterisk(obj, name) {
  const x = obj[name];
  obj[name] = {};
  obj[name][marker.name] = markerMap.highlight.name;
  obj[name][marker.content] = x;
}

function mark({ sourceObj, lineNo }) {
  if (lineNo !== null)
    traverse(sourceObj)
      .toLineNo(lineNo)
      .then((o, name) => { appendAsterisk(o, name) });
  return sourceObj;
}

module.exports = { mark_line: mark };
