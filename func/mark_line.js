const traverse = require('../utils/traverse');

function markThunk({ marker, markerMap }) {
  function appendAsterisk(obj, name) {
    const x = obj[name];
    obj[name] = {};
    obj[name][marker.name] = markerMap.highlight.name;
    obj[name][marker.content] = x;
  }

  function mark({ sourceObj, lineNo }) {
    if (lineNo !== null && sourceObj !== null)
      traverse(sourceObj)
        .toLineNo(lineNo)
        .then((o, name) => { appendAsterisk(o, name) });
    return sourceObj;
  }

  return mark;
}

module.exports = { mark_line: markThunk };
