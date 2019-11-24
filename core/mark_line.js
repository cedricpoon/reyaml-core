const traverse = require('../utils/traverse');

function appendAsterisk(obj, name) {
  obj[name] = { '*': '', '**': obj[name] };
}

// function traverse({ sourceObj, lineNo }) {
//   return new Promise((resolve, reject) => {
//
//     const _tr = ({ sourceObj, lineNo, index }) => {
//       if (sourceObj)
//         Object.keys(sourceObj).map(name => {
//           if ((!Array.isArray(sourceObj) || typeof sourceObj[name] !== 'object') && index++ === lineNo) resolve(sourceObj, name);
//           if (typeof sourceObj[name] === 'object') index = traverse({ sourceObj: sourceObj[name], lineNo, index });
//         });
//       return index;
//     }
//
//     _tr({ sourceObj, lineNo, index: 0 });
//   });
// }

function mark({ sourceObj, lineNo }) {
  if (lineNo !== null)
    traverse(sourceObj).with((o, name) => { appendAsterisk(o, name) }).byLineNo(lineNo);
  return sourceObj;
}

module.exports = { mark_line: mark };
