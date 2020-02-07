const traverse = require('../utils/traverse');
const modify = require('../utils/modify');
const Traverse = traverse();  // get class

function truncateThunk({ marker, markerMap, symbol }) {
  let trimMark = true; // global mutable variable

  function truncChildren({ sourceObj, level }) {
    const _trunc = (o, lv) => Object.keys(o).map(name => {
      if (o[name]) {
        if (typeof o[name] === 'object' && lv > 0)
          _trunc(
            o[name],
            lv - (Object.prototype.hasOwnProperty.call(o[name], marker.name) ? 0 : 1)
          );
        else if (typeof o[name] === 'object' && trimMark) {
          o[name] = {};
          o[name][marker.name] = markerMap.truncatedDown.name;
        } else if (typeof o[name] === 'object') {
          o[name] = null;
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
        .then((o, name) => { topMost = false; obj = o; });
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
    if (sourceObj !== parent && Object.keys(parent).length > 1 && trimMark) { // case of uplifted dummy parent
      const x = {};
      x[marker.name] = markerMap.truncatedUp.name;
      if (Array.isArray(parent))
        x[marker.content] = [ ...parent ];
      else
        x[marker.content] = { ...parent };
      parent = x;
      i--;  // compensate an extra level created by truncatedUp
    }
    sourceObj = parent;
    truncChildren({ sourceObj, level: level * 2 - i }); // `o` as parent
    return sourceObj;
  }

  const markTrim = (o, sym, type) => {
    if (trimMark) {
      const o2a = Array.isArray(o) ? {
        [marker.name]: type.name
      } : {
        [sym]: { [marker.name]: type.name }
      };
      if (sym === symbol.sectionLeft)
        modify(o).prepend(o2a);
      else
        modify(o).append(o2a);
    }
  };

  function trimLHS({ o, names, siblingSize, pivot }) {
    let flg = false;
    for (let i = 0; i < pivot - siblingSize; i++) { // handle excessive LHS
      delete o[names[i]];
      flg = true;
    }
    if (flg) markTrim(o, symbol.sectionLeft, markerMap.truncatedLeft); // left arrow
  }

  function trimChildrenFromLHS({ o, names, siblingSize, pivot }) {
    let retainSize = 0;
    let flg = false;

    for (let i = pivot - siblingSize > 0 ? pivot - siblingSize : 0; i < pivot; i++) // handle remaining LHS
      if (o[names[i]])
        traverse(o[names[i]])
          .eachInodes(Traverse.from.RIGHT_TO_LEFT)
          .whenNextLevel(o2 => {
            retainSize = 0; // reset retainment
            if (flg) markTrim(o2, symbol.sectionLeft, markerMap.truncatedLeft); // left arrow
            flg = false; // reset flag
          })
          .then((o2, name2) => {
            if (retainSize++ >= siblingSize) {
              delete o2[name2];
              flg = true;
            }
          });
  }

  function trimRHS({ o, names, siblingSize, pivot }) {
    let flg = false;
    for (let i = names.length - 1; i > pivot + siblingSize; i--) { // handle excessive RHS
      delete o[names[i]];
      flg = true;
    }
    if (flg) markTrim(o, symbol.sectionRight, markerMap.truncatedRight); // right arrow
  }

  function trimChildrenFromRHS({ o, names, siblingSize, pivot }) {
    let retainSize = 0;
    let flg = false;

    for (let i = pivot + siblingSize < names.length ? pivot + siblingSize : names.length - 1; i > pivot; i--) // handle remaining RHS
      if (o[names[i]])
        traverse(o[names[i]])
          .eachInodes(Traverse.from.LEFT_TO_RIGHT)
          .whenNextLevel(o2 => {
            retainSize = 0; // reset retainment
            if (flg) markTrim(o2, symbol.sectionRight, markerMap.truncatedRight); // right arrow
            flg = false; // reset flag
          })
          .then((o2, name2) => {
            if (retainSize++ >= siblingSize) {
              delete o2[name2];
              flg = true;
            }
          });
  }

  function truncSiblings({ o, name, siblingSize }) {
    if (o && typeof o === 'object') { // guard to be non-null object
      const names = Object.keys(o);
      const pivot = names.findIndex(x => x === name);

      trimLHS({ o, names, siblingSize, pivot });
      trimChildrenFromLHS({ o, names, siblingSize, pivot });
      trimRHS({ o, names, siblingSize, pivot });
      trimChildrenFromRHS({ o, names, siblingSize, pivot });
    }
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

  function truncate({ sourceObj, level, siblingSize, lineNo, trimMark: _trimMark }) {
    trimMark = _trimMark; // set global mutable variable
    
    if (level !== null && sourceObj !== null)
      traverse(sourceObj)
        .toLineNo(lineNo)
        .then((o, name, _self) => {
          if (name === marker.content || name === marker.name) {
            const r = _self.toObject(o).return; // if marked backtrack 1 level
            o = r.o;
            name = r.name;
          }
          if (level >= 0)
            sourceObj = vertically({ level, sourceObj, o });  // apply leveling rule
          if (siblingSize >= 0) {
            if (Object.prototype.hasOwnProperty.call(o[name], marker.name)
                && o[name][marker.content]
                && typeof o[name][marker.content] === 'object') // lineNo must be object
            {
              const { o: o2, name: name2 } = traverse(o[name][marker.content]).toDeepestTerminal(Traverse.to.MIDDLE).return; // deepest terminal of lineNo
              sourceObj = horizontally({ siblingSize, sourceObj, targetObj: o2 }); // apply sibling rule to deepest inode containing o
              truncSiblings({ o: o2, name: name2, siblingSize }); // apply sibling rule to deepest terminals
            } else {
              sourceObj = horizontally({ siblingSize, sourceObj, targetObj: o[name] }); // apply sibling rule on leveled tree
              truncSiblings({ o, name, siblingSize }); // apply sibling rule to deepest terminals
            }
          }
        });
    return sourceObj;
  }

  return truncate;
}
module.exports = { truncate: truncateThunk };
