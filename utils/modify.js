const modify = sourceObj => sourceObj ? new Modify(sourceObj) : Modify;

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
      const temp = modify({});
      Object.keys(this._source).forEach(name => {
        if (this._source[name] !== o) {
          temp.append({ [name]: this._source[name] });
          delete this._source[name];
        }
      });
      this.append(o);
      this.append(temp.self);
    }
    return this;
  }

  get self() { return this._source; }
}

module.exports = modify;
