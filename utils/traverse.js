function getNumberOfNewLineChar(ln) {
  if (typeof ln === 'string') {
    const r = ln.match(/\n/g);
    return r ? r.length : 0;
  }
  return 0;
}

function traverse(sourceObj) {  // instantiation shorthand
  return sourceObj ? new Traverse(sourceObj) : Traverse;
}

class Traverse {
  /* Enums for direction */
  static get from() { return { LEFT_TO_RIGHT: 0, RIGHT_TO_LEFT: 1 } }

  /* Enums for target */
  static get to() { return { FIRST: 0, MIDDLE: 1, LAST: 2 } }

  constructor(sourceObj) {
    this._source = sourceObj;
    this._run = () => {};
  }

  eachInodes(dir = Traverse.from.LEFT_TO_RIGHT) {  // breadth-wise
    this._run = (callback, nextLevelHandler) => {
      const queue = [];
      const _tr = sourceObj => {
        if (sourceObj) {
          const keys = Object.keys(sourceObj);
          if (dir === Traverse.from.RIGHT_TO_LEFT)
            keys.reverse();
          keys.forEach((name) => {
            callback(sourceObj, name, this);
            if (typeof sourceObj[name] === 'object')
              queue.push({ name, o: sourceObj });
          });
          nextLevelHandler(sourceObj, this);  // end of this level as keys.forEach done
        }
      }
      if (typeof this._source === 'object')
        _tr(this._source);
      while (queue.length > 0) {
        const { name: name2, o: o2 } = queue.shift();
        _tr(o2[name2]);
      }
    };
    return new TraverseEachInodes(this);
  }

  eachInodesWithObject(obj) {
    this._run = callback => {
      const _stk = [];
      const _tr = (sourceObj) => {
        if (sourceObj) {
          const keys = Object.keys(sourceObj);
          return keys.reduce((isObjChild, name) => {
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

  toDeepestTerminal(target = Traverse.to.FIRST) {
    this._run = callback => {
      const { o } = this.eachInodes(Traverse.from.RIGHT_TO_LEFT).return;
      if (o) {
        const names = Object.keys(o);
        switch(target) {
          case Traverse.to.FIRST:
            callback(o, names[0], this); break;
          case Traverse.to.MIDDLE:
            callback(o, names[Math.floor(names.length / 2)], this); break;
          case Traverse.to.LAST:
            callback(o, names[names.length - 1], this); break;
        }
      }
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

  get return() {
    let o = null, name = null;
    this._run((_o, _name) => { o = _o; name = _name; });
    return { o, name };
  }

  get self() { return this._source; }
}

class TraverseEachInodes extends Traverse {
  constructor(traverser) {
    super(traverser._source);
    super._run = traverser._run;
    this._nextLevel = () => {};
  }

  whenNextLevel(f) {
    this._nextLevel = f;
    return this;
  }

  then(f) { this._run(f, this._nextLevel); return this; }

  get return() {
    let o = null, name = null;
    this._run((_o, _name) => { o = _o; name = _name; }, this._nextLevel);
    return { o, name };
  }
}

module.exports = traverse;
