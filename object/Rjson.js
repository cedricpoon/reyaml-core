const config = require('../config');
const { insert } = require('../func/insert');
const { transform_d3 } = require('../func/transform_d3');
const { mark_line } = require('../func/mark_line');
const { count_key } = require('../func/count_key');
const { truncate } = require('../func/truncate');
const traverse = require('../utils/traverse');
const modify = require('../utils/modify');

class Rjson {
  /**
   * Constructor.
   *
   * @param {Object} raw JSON Object.
   * @param {Object} env Immutable environment setup using config.js as default.
   */
  constructor(raw, env = config) {
    this._raw = raw;
    this._config = JSON.parse(JSON.stringify(env));
  }

  /**
   * Clone this._raw via stringify-parsing.
   *
   * @returns {Object} Immutable Rjson.
   */
  clone() {
    return new Rjson(JSON.parse(JSON.stringify(this._raw)));
  }

  /**
   * Insert "insertee" inside every "key" in object hierarchy.
   *
   * @param {key} key Key of keypair in object.
   * @param {Object} insertee Immutable Rjson to be inserted.
   * @returns {Object} Immutable Rjson.
   */
  insert({ key, insertee }) {
    return new Rjson(insert({ key, jsSource: this.clone().raw, jsNew: insertee.clone().raw }))
  }

  /**
   * Transform raw object on active YAML line to target marked form.
   *
   * @param {int} lineNo Active YAML line number for indicating which object in raw object hierarchy to be transformed.
   * @returns {Object} Immutable Rjson.
   */
  markLine({ lineNo }) {
    return new Rjson(mark_line({ ...this._config })({ sourceObj: this.clone().raw, lineNo }))
  }

  /**
   * Truncate raw object hierarchy pivoted to object with lineNo, vertically by level, horizontally by siblingSize.
   *
   * @param {int} level Trim N level upwards N level downwards.
   * @param {int} siblingSize Trim N left siblings N right siblings.
   * @param {int} lineNo Pivot to lineNo for trimming.
   * @returns {Object} Immutable Rjson.
   */
  truncate({ level, siblingSize, lineNo }) {
    return new Rjson(truncate({ ...this._config })({ sourceObj: this.clone().raw, lineNo, level, siblingSize }));
  }

  /**
   * Traverse raw object.
   *
   * @param {Function} traverser => traverser.toXXX().then() Actual traverse using traverse() with clone of raw object.
   * @returns {Object} Immutable Rjson.
   */
  traverse(t) {
    return new Rjson(t(traverse(this.clone().raw)).self);
  }

  /**
   * Modify raw object.
   *
   * @param {Function} modifier => modifier.xxx().yyy() Modify using modify() with clone of raw object.
   * @returns {Object} Immutable Rjson.
   */
  modify(m) {
    return new Rjson(m(modify(this.clone().raw)).self);
  }

  /**
   * Convert to D3 structured object.
   *
   * @returns {Object} JSON object in D3 structure.
   */
  toD3({ profile = 'default' } = {}) {
    return transform_d3({ ...this._config })[profile]({ sourceObj: this._raw });
  }

  /**
   * Count number of keys in raw object.
   *
   * @returns {int} Number of keys in raw object.
   */
  get keyCount() { return count_key({ sourceObj: this._raw }); }
  
  /**
   * Getter for raw.
   *
   * @returns {Object} this._raw.
   */
  get raw() { return this._raw }
}

module.exports = Rjson;
