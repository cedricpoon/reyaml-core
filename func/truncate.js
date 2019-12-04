const traverse = require('../utils/traverse');
const { marker, markerMap } = require('../config');

function truncChildren({ sourceObj, level }) {
  const _trunc = (o, lv) => Object.keys(o).map(name => {
    if (o[name]) {
      if (typeof o[name] === 'object' && lv > 0)
        _trunc(o[name], lv - (Array.isArray(o[name]) || o[name].hasOwnProperty(marker.name) ? 0 : 1));
      else if (typeof o[name] === 'object') {
        o[name] = {};
        o[name][marker.name] = markerMap.truncatedDown.name;
      }
    }
  });

  _trunc(sourceObj, level);
}

function findParent({ sourceObj, obj, level }) {
  for (i = 0; i < level; i++) {
    let topMost = true;
    traverse(sourceObj)
      .update((o, name) => { topMost = false; obj = o; if (Array.isArray(obj)) i--; })
      .byObject(obj);
    if (topMost) return { parent: obj, i: level - i };
  }
  return { parent: obj, i: 0 };
}

function truncate({ sourceObj, level, lineNo }) {
  if (level !== null)
    traverse(sourceObj)
      .update((o, name) => {
        let { parent, i } = findParent({  // `o` as parent
          sourceObj,
          obj: o,
          level: o.hasOwnProperty(marker.name) ? level + 1 : level
        });
        if (sourceObj !== parent && Object.keys(parent).length > 1) { // case of uplifted dummy parent
          const x = {};
          x[marker.name] = markerMap.truncatedUp.name;
          x[marker.content] = { ...parent };
          parent = x;
          i--;  // compensate an extra level created by truncatedUp
        } else if (sourceObj === parent && Array.isArray(parent)) {  // case of origin array dummy parent
          i--;
        }
        sourceObj = parent;
        truncChildren({ sourceObj, level: level * 2 - i }); // `o` as parent
      })
      .byLineNo(lineNo);
  return sourceObj;
}

module.exports = { truncate };
