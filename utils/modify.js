function modify(sourceObj) {  // instantiation shorthand
  return sourceObj ? new Modify(sourceObj) : Modify;
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

class Modify {
  constructor(sourceObj) {
    this._source = sourceObj; // clone object
  }

  append(o) {
    Object.keys(o).forEach(key => {
      this._source[key] = o[key];
    });
    return this;
  }

  prepend(o) {
    const oo = clone(o);
    Object.keys(this._source).forEach(key => {
      oo[key] = this._source[key];
    });
    this._source = oo;
    return this;
  }
}

module.exports = modify;
