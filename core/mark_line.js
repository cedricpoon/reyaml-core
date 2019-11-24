const traverse = require('../utils/traverse');

function appendAsterisk(obj, name) {
  obj[name] = { '*': '', '**': obj[name] };
}

function mark({ sourceObj, lineNo }) {
  if (lineNo !== null)
    traverse(sourceObj)
      .to((o, name) => { appendAsterisk(o, name) })
      .byLineNo(lineNo);
  return sourceObj;
}

module.exports = { mark_line: mark };
