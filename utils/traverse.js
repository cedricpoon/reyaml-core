class Traverse {
  constructor(sourceObj) {
    this._source = sourceObj;
    this._callback = () => {};
  }

  _getNewLineNo(ln) {
    let n = 0;
    try { n = ln.match(/\n/g).length }
    catch { /* ignored */ }
    return n;
  }

  byLineNo(lineNo) {
    const _tr = ({ sourceObj, lineNo, index }) => {
      if (sourceObj) {
        const keys = Object.keys(sourceObj);
        let i = 0;
        for (; i < keys.length; i++) {
          const name = keys[i];
          if (!Array.isArray(sourceObj) || typeof sourceObj[name] !== 'object') {
            const newLineNo = this._getNewLineNo(sourceObj[name]);
            if (newLineNo === 0 && index === lineNo)
              this._callback(sourceObj, name);
            else if (newLineNo > 0) {
              if (lineNo >= index && lineNo <= index + newLineNo)
                this._callback(sourceObj, name);
              index += newLineNo;
            }
            index++;
            if (typeof sourceObj[name] === 'object') index = _tr({ sourceObj: sourceObj[name], lineNo, index });
          }
          else if (typeof sourceObj[name] === 'object') index = _tr({ sourceObj: sourceObj[name], lineNo, index });
        }
      }
      return index;
    }
    _tr({ sourceObj: this._source, lineNo, index: 0 });
    return this;
  }

  byObject(obj) {
    const _tr = ({ sourceObj, obj }) => {
      if (sourceObj)
        Object.keys(sourceObj).map(name => {
          if (obj === sourceObj[name]) this._callback(sourceObj, name);
          else if (typeof sourceObj[name] === 'object') _tr({ sourceObj: sourceObj[name], obj });
        });
    }
    _tr({ sourceObj: this._source, obj });
    return this;
  }

  update(f) { this._callback = f; return this; }

  get result() { return this._source; }
}

function traverse(sourceObj) {
  return new Traverse(sourceObj);
}

module.exports = traverse;
