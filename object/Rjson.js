const { insert } = require('../core/insert');
const { transform_d3 } = require('../core/transform_d3');
const { mark_line } = require('../core/mark_line');
const { count_key } = require('../core/count_key');

class Rjson {
  constructor(json) {
    this.json = json;
  }

  insert({ key, insertee }) {
    return new Rjson(insert({ key, jsSource: this.json, jsNew: insertee.json }));
  }

  markLine({ lineNo }) {
    return new Rjson(mark_line({ sourceObj: this.json, lineNo }));
  }

  get raw() { return this.json; }

  get d3() { return transform_d3({ sourceObj: this.json }) }

  get keyCount() { return count_key({ sourceObj: this.json });
  }
}

module.exports = Rjson;