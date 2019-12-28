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
    if (Array.isArray(this._source)) {
      const keys = Object.keys(this._source)
      if (keys.length > 0 && keys[keys.length - 1] < this._source.length - 1)
        this._source[parseInt(keys[keys.length - 1]) + 1] = o;
      else
        this._source.push(o);
    } else {
      Object.keys(o).forEach(key => {
        this._source[key] = o[key];
      });
    }
    return this;
  }

  prepend(o) {
    if (Array.isArray(this._source)) {
      const keys = Object.keys(this._source)
      if (keys[0] && keys[0] > 0)
        this._source[keys[0] - 1] = o;
      else
        this._source.unshift(o);
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
