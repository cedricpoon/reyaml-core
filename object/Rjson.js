const { insert } = require('../func/insert');
const { transform_d3 } = require('../func/transform_d3');
const { mark_line } = require('../func/mark_line');
const { count_key } = require('../func/count_key');
const { truncate } = require('../func/truncate');

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
