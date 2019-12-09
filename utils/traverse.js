function getNumberOfNewLineChar(ln) {
  let n = 0;
  try { n = ln.match(/\n/g).length }
  catch { /* ignored */ }
  return n;
}

class Traverse {
  constructor(sourceObj) {
    this._source = sourceObj;
    this._run = () => {};
  }

  eachInodesWithObject(obj) {  // breadth-wise
    this._run = callback => {
      const _tr = ({ sourceObj }) => {
        if (sourceObj) {
          const keys = Object.keys(sourceObj);
          keys.forEach((name, i) => {
            if (typeof sourceObj[name] === 'object') {
              traverse([sourceObj[name]]) // if obj in sourceObj[name]
                .toObject(obj)
                .then(() => {
                  callback(sourceObj, name, this);
                  _tr({ sourceObj: sourceObj[name] });
                });
            }
          });
        }
      };
      _tr({ sourceObj: this._source });
    };
    return this;
  }

  toLineNo(lineNo) {
    this._run = callback => {
      const _tr = ({ sourceObj, lineNo, index }) => {
        if (sourceObj) {
          const keys = Object.keys(sourceObj);
          let i = 0;
          for (; i < keys.length; i++) {
            const name = keys[i];
            if (!Array.isArray(sourceObj) || typeof sourceObj[name] !== 'object') {
              const newLineNo = getNumberOfNewLineChar(sourceObj[name]);
              if (newLineNo === 0 && index === lineNo)
                callback(sourceObj, name, this);
              else if (newLineNo > 0) {
                if (lineNo >= index && lineNo <= index + newLineNo)
                  callback(sourceObj, name, this);
                index += newLineNo;
              }
              index++;
            }
            if (typeof sourceObj[name] === 'object') index = _tr({ sourceObj: sourceObj[name], lineNo, index });
          }
        }
        return index;
      }
      _tr({ sourceObj: this._source, lineNo, index: 0 });
    };
    return this;
  }

  toObject(obj) {
    this._run = callback => {
      const _tr = ({ sourceObj, obj }) => {
        if (sourceObj)
          Object.keys(sourceObj).map(name => {
            if (obj === sourceObj[name]) callback(sourceObj, name, this);
            else if (typeof sourceObj[name] === 'object') _tr({ sourceObj: sourceObj[name], obj });
          });
      }
      _tr({ sourceObj: this._source, obj });
    };
    return this;
  }

  then(f) { this._run(f); return this; }

  get result() {
    let o = null, name = null;
    this._run((_o, _name) => { o = _o; name = _name; });
    return { o, name };
  }

  get self() { return this._source; }
}

function traverse(sourceObj) {
  return new Traverse(sourceObj);
}

module.exports = traverse;
