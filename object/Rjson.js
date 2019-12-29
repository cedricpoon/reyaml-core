const { insert } = require('../func/insert');
const { transform_d3 } = require('../func/transform_d3');
const { mark_line } = require('../func/mark_line');
const { count_key } = require('../func/count_key');
const { truncate } = require('../func/truncate');
const traverse = require('../utils/traverse');
const modify = require('../utils/modify');

const ifNullThenX = (_this, f, x) => { return _this.raw ? f() : x };

class Rjson {
  constructor(raw) {
    this.raw = raw;
  }

  insert({ key, insertee }) {
    return ifNullThenX(this, () => new Rjson(insert({ key, jsSource: this.raw, jsNew: insertee.raw })), this);
  }

  markLine({ lineNo }) {
    return ifNullThenX(this, () => new Rjson(mark_line({ sourceObj: this.raw, lineNo })), this);
  }

  truncate({ level, siblingSize, lineNo }) {
    return ifNullThenX(this, () => new Rjson(truncate({ sourceObj: this.raw, lineNo, level, siblingSize })), this);
  }

  traverse() {
    return traverse(this.raw);
  }

  modify() {
    return modify(this.raw);
  }

  toD3() {
    return ifNullThenX(this, () => transform_d3({ sourceObj: this.raw }), null);
  }

  get keyCount() { return count_key({ sourceObj: this.raw }); }
}

module.exports = Rjson;
