class Traverse {
  constructor(sourceObj) {
    this._source = sourceObj;
    this._callback = () => {};
  }

  byLineNo(lineNo) {
    const _tr = ({ sourceObj, lineNo, index }) => {
      if (sourceObj)
        Object.keys(sourceObj).map(name => {
          if ((!Array.isArray(sourceObj) || typeof sourceObj[name] !== 'object') && index++ === lineNo) this._callback(sourceObj, name);
          else if (typeof sourceObj[name] === 'object') index = _tr({ sourceObj: sourceObj[name], lineNo, index });
        });
      return index;
    }

    _tr({ sourceObj: this._source, lineNo, index: 0 });

    return this;
  }

  byObject(obj) {
    const _tr = ({ sourceObj, obj }) => {
      if (sourceObj)
        Object.keys(sourceObj).map(name => {
          if ((!Array.isArray(sourceObj) || typeof sourceObj[name] !== 'object') && obj === sourceObj[name]) this._callback(sourceObj, name);
          else if (typeof sourceObj[name] === 'object') index = _tr({ sourceObj: sourceObj[name], obj });
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
