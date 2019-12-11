const traverse = require('../utils/traverse');
const Traverse = traverse();  // get class
const { marker, markerMap } = require('../config');

function truncChildren({ sourceObj, level }) {
  const _trunc = (o, lv) => Object.keys(o).map(name => {
    if (o[name]) {
      if (typeof o[name] === 'object' && lv > 0)
        _trunc(o[name],
          lv - (Array.isArray(o[name]) || Object.prototype.hasOwnProperty.call(o[name], marker.name) ? 0 : 1)
        );
      else if (typeof o[name] === 'object') {
        o[name] = {};
        o[name][marker.name] = markerMap.truncatedDown.name;
      }
    }
  });
  _trunc(sourceObj, level);
}

function findParent({ sourceObj, obj, level }) {
  for (let i = 0; i < level; i++) {
    let topMost = true;
    traverse(sourceObj)
      .toObject(obj)
      // eslint-disable-next-line no-unused-vars
      .then((o, name) => { topMost = false; obj = o; if (Array.isArray(obj)) i--; });
    if (topMost) return { parent: obj, i: level - i };
  }
  return { parent: obj, i: 0 };
}

function vertically({ level, sourceObj, o }) {
  let { parent, i } = findParent({  // `o` as parent
    sourceObj,
    obj: o,
    level: Object.prototype.hasOwnProperty.call(o, marker.name) ? level + 1 : level
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
  return sourceObj;
}

function truncSiblings({ o, name, siblingSize }) {
  const names = Object.keys(o);
  const pivot = names.findIndex(x => x === name);
  let retainSize = 0;
  const resetRetain = () => { retainSize = 0; };

  for (let i = 0; i < pivot - siblingSize; i++) // handle excessive LHS
    delete o[names[i]];

  for (let i = pivot - siblingSize > 0 ? pivot - siblingSize : 0; i < pivot; i++) // handle remaining LHS
    if (o[names[i]])
      traverse(o[names[i]])
        .eachInodes(Traverse.from.RIGHT_TO_LEFT, resetRetain)
        .then((o2, name2) => {
          if (retainSize++ >= siblingSize)
            delete o2[name2];
        });

  for (let i = names.length - 1; i > pivot + siblingSize; i--) // handle excessive RHS
    delete o[names[i]];

  for (let i = pivot + siblingSize < names.length ? pivot + siblingSize : names.length - 1; i > pivot; i--) // handle remaining RHS
    if (o[names[i]])
      traverse(o[names[i]])
        .eachInodes(Traverse.from.LEFT_TO_RIGHT, resetRetain)
        .then((o2, name2) => {
          if (retainSize++ >= siblingSize)
            delete o2[name2];
        });
}

function horizontally({ siblingSize, sourceObj, targetObj }) {
  traverse(sourceObj)
    .eachInodesWithObject(targetObj)
    .then((o, name) => {
      if (!Object.prototype.hasOwnProperty.call(o, marker.name))
        truncSiblings({ o, name, siblingSize });
    });
  return sourceObj;
}

function truncate({ sourceObj, level, lineNo }) {
  if (level !== null)
    traverse(sourceObj)
      .toLineNo(lineNo)
      .then((o, name, _self) => {
        if (name === marker.content || name === marker.name) {
          const r = _self.toObject(o).result; // if marked backtrack 1 level
          o = r.o;
          name = r.name;
        }
        sourceObj = vertically({ level, sourceObj, o });  // apply leveling rule
        sourceObj = horizontally({ siblingSize: 2, sourceObj, targetObj: o[name] }); // apply sibling rule on leveled tree
      });
  return sourceObj;
}

module.exports = { truncate };
