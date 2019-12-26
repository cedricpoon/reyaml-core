function modify(sourceObj) {  // instantiation shorthand
  return sourceObj ? new Modify(sourceObj) : Modify;
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

class Modify {
  constructor(sourceObj) {
    this._source = sourceObj;
  }

  append(o) {
    Object.keys(o).forEach(key => {
      if (Array.isArray(this._source))
        this._source.push(o[key]);
      else
        this._source[key] = o[key];
    });
    return this;
  }

  prepend(o) {
    if (Array.isArray(this._source)) {
      Object.keys(o).reverse().forEach(key => {
        this._source.unshift(o[key]);
      });
    } else {
      const _source2 = clone(this._source);
      Object.keys(this._source).forEach(key => {
        delete this._source[key];
      });
      modify(this._source).append(o);
      modify(this._source).append(_source2);
    }
    return this;
  }
}

module.exports = modify;
