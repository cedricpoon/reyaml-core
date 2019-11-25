const traverse = require('../utils/traverse');

function truncChildren({ sourceObj, level }) {
  const _trunc = (o, lv) => Object.keys(o).map(name => {
    if (typeof o[name] === 'object' && lv > 0) _trunc(o[name], lv - (Array.isArray(o[name]) ? 0 : 1));
    else if (typeof o[name] === 'object') o[name] = '...more'
  });

  _trunc(sourceObj, level);
}

function findParent({ sourceObj, obj, level }) {
  for (i = 0; i < level; i++)
    traverse(sourceObj)
      .update((o, name) => { obj = o; if (Array.isArray(obj)) i--; })
      .byObject(obj);
  return obj;
}

function truncate({ sourceObj, level, lineNo }) {
  if (level !== null)
    traverse(sourceObj)
      .update((o, name) => {
        sourceObj = findParent({ sourceObj, obj: o, level });  // `o` as parent
        //truncChildren({ sourceObj, level: level * 2 }); // `o` as parent
      })
      .byLineNo(lineNo);
  return sourceObj;
}

module.exports = { truncate };
