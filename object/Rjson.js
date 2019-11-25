const { insert } = require('../core/insert');
const { transform_d3 } = require('../core/transform_d3');
const { mark_line } = require('../core/mark_line');
const { count_key } = require('../core/count_key');
const { truncate } = require('../core/truncate');

class Rjson {
  constructor(raw) {
    this.raw = raw;
  }

  insert({ key, insertee }) {
    return new Rjson(insert({ key, jsSource: this.raw, jsNew: insertee.raw }));
  }

  markLine({ lineNo }) {
    return new Rjson(mark_line({ sourceObj: this.raw, lineNo }));
  }

  truncate({ level, lineNo }) {
    return new Rjson(truncate({ sourceObj: this.raw, lineNo, level }));
  }

  get d3() { return transform_d3({ sourceObj: this.raw }) }

  get keyCount() { return count_key({ sourceObj: this.raw }); }
}

module.exports = Rjson;
