function appendAsterisk(obj, name) {
  obj[name] = { '*': '', '**': obj[name] }
}

function traverse({ sourceObj, lineNo, index }) {
  Object.keys(sourceObj).map(name => {
    if ( !Array.isArray(sourceObj) && index++ === lineNo) appendAsterisk(sourceObj, name);
    if (typeof sourceObj[name] === 'object') index = traverse({ sourceObj: sourceObj[name], lineNo, index });
  });
  return index;
}

function mark({ sourceObj, lineNo }) {
  traverse({ sourceObj, lineNo, index: 0 });
  return sourceObj
}

module.exports = { mark_line: mark };
