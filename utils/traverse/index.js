const fn = require('./fn');

class Traverse {
  /**
   * @static Getter of enumeration for traversing directions
   *
   * @return {Object} Enumeration for traversing directions
   */
  static get from() { return { LEFT_TO_RIGHT: 0, RIGHT_TO_LEFT: 1 } }

  /**
   * @static Getter of enumeration for targets
   *
   * @return {Object} Enumeration for targets
   */
  static get to() { return { FIRST: 0, MIDDLE: 1, LAST: 2 } }

  /**
   * Constructor
   *
   * @param  {Object} sourceObj Object to be traversed
   */
  constructor(sourceObj) {
    this._source = sourceObj;
    this._run = () => {};
  }

  /**
   * Run then() on each inodes breadth-wise and run whenNextLevel() for each level advancement
   *
   * @param  {enum} dir = Traverse.from.LEFT_TO_RIGHT direction for breadth-wise traverse
   * @return {Object} TraverseEachInodes object with extra whenNextLevel()
   */
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

  /**
   * Run then() on each inodes containing `obj`, starting from root depth-wise
   *
   * @param  {Object} obj Each traverse must contain obj as children
   * @return {Object} Mutable self reference
   */
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

  /**
   * Run then() on the deepest terminal
   *
   * @param  {enum} target = Traverse.to.FIRST if deepest terminal has siblings, determine which to run then()
   * @return {Object} Mutable self reference
   */
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

  /**
   * Run then() on specific line number, with reference to the YAML form of this._source
   *
   * @param  {int} lineNo Presented as numeric index of this._source as leveled breadth-wise, root as 0
   * @return {Object} Mutable self reference
   */
  toLineNo(lineNo) {
    this._run = callback => {
      const _tr = ({ sourceObj, lineNo, index }) => {
        if (sourceObj) {
          const keys = Object.keys(sourceObj);
          let i = 0;
          for (; i < keys.length; i++) {
            const name = keys[i];
            if (!Array.isArray(sourceObj) || typeof sourceObj[name] !== 'object') {
              const newLineNo = fn.getNumberOfNewLineChar(sourceObj[name]);
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

  /**
   * Run then() on specific object `obj`
   *
   * @param  {Object} obj Specific object to traverse
   * @return {Object} Mutable self reference
   */
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

  /**
   * Promise.js like then() function, runner on every targeted traverse
   *
   * @param  {Function} f callback
   * @return {Object} Mutable self reference
   */
  then(f) { this._run(f); return this; }

  /**
   * @typedef {Object} Return
   * @property {Object} o Parent
   * @property {string} name Key
   */
  /**
   * Flattening then() to return LAST result (i.e. parameters passed to `f`) without callback
   *
   * @return {Return} Last result of all callback to be executed in each traverse
   */
  get return() {
    let o = null, name = null;
    this._run((_o, _name) => { o = _o; name = _name; });
    return { o, name };
  }

  /**
   * Getter of this._source
   *
   * @return {Object} Raw underlying object
   */
  get self() { return this._source; }
}

class TraverseEachInodes extends Traverse {
  /**
   * Constructor
   *
   * @param  {Traverse} traverser Traverse adapter fo providing whenNextLevel in then() and return()
   */
  constructor(traverser) {
    super(traverser._source);
    super._run = traverser._run;
    this._nextLevel = () => {};
  }

  /**
   * Runner for `eachInodes()` breadth-wise level advancement
   *
   * @param  {Function} f callback
   * @return {Object} Mutable self reference
   */
  whenNextLevel(f) {
    this._nextLevel = f;
    return this;
  }

  /**
   * Extending then() for adding this._nextLevel during call
   *
   * @param  {Function} f callback
   * @return {Object} Mutable self reference
   */
  then(f) { this._run(f, this._nextLevel); return this; }

  /**
   * Extending return() for adding this._nextLevel during call
   *
   * @return {Return} Last result of all callback to be executed in each traverse
   */
  get return() {
    let o = null, name = null;
    this._run((_o, _name) => { o = _o; name = _name; }, this._nextLevel);
    return { o, name };
  }
}

module.exports = o => o ? new Traverse(o) : Traverse;
