function getNumberOfNewLineChar(ln) {
  if (typeof ln === 'string') {
    const r = ln.match(/\n/g);
    return r ? r.length : 0;
  }
  return 0;
}

class Traverse {
  constructor(sourceObj) {
    this._source = sourceObj;
    this._run = () => {};
  }

  eachInodesWithObject(obj) {
    this._run = callback => {
      const _stk = [];
      const _tr = (sourceObj) => {
        if (sourceObj) {
          const keys = Object.keys(sourceObj);
          return keys.reduce((isObjChild, name, i) => {
            if (typeof sourceObj[name] === 'object') {
              const r = _tr(sourceObj[name]);
              if (r) _stk.push(name);
              return r || isObjChild;
            } else {
              return obj === sourceObj || isObjChild;
            }
          }, false);
        }
      };
      _tr(this._source);
      const _walk = (sourceObj) => {
        if (_stk.length > 0) {
          callback(sourceObj, _stk[_stk.length - 1], this);
          _walk(sourceObj[_stk.pop()]);
        }
      };
      _walk(this._source);
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
