const config = require('../../config');
const { count_junk_line, is_junk_line } = require('../func/count_junk_line');
const { transform_js } = require('../func/transform_js');
const { patcher, patch_yaml } = require('../func/patch_yaml');
const Rjson = require('./Rjson');

class Ryaml {
  /**
   * @static Determine whenever it is a junk line.
   *
   * @param {string} line String to be determined.
   * @returns {boolean} Is junk line or not.
   */
  static isJunkLine({ line }) {
    return is_junk_line(line);
  }

  /**
   * Constructor.
   *
   * @param {string} raw YAML string.
   * @param {Object} env Immutable environment setup using config.js as default.
   */
  constructor(raw, env = config) {
    this._raw = raw;
    this._config = JSON.parse(JSON.stringify(env));
  }

  /**
   * Count number of junk lines (e.g. empty line) in YAML string.
   *
   * @param {number} lineNo For getting junk line before given line number, unset to be counting all lines.
   * @returns {number} Number of junk lines.
   */
  countJunkLine({ lineNo } = {}) {
    return count_junk_line({ sourceYaml: this._raw, lineNo });
  }

  /**
   * Patch YAML string with given patcher function.
   *
   * @param {Function} patcher => patcher.xxx().yyy() For actual patching the original YAML string.
   * @returns {Object} Immutable Ryaml with new YAML string.
   */
  patch(p) {
    return new Ryaml(p(patcher(this._raw)).result());
  }

  /**
   * Convert to Rjson object.
   *
   * @param {string} profile To let patch_yaml know which profile should it use for patching YAML string.
   * @returns {Object} Immutable Rjson.
   */
  toRjson({ profile = 'default' } = {}) {
    return new Rjson(transform_js({ yamlString: patch_yaml({ ...this._config })[profile]({ yamlString: this._raw }) }));
  }
  
  /**
   * Getter for raw.
   *
   * @returns {string} this._raw.
   */
  get raw() { return this._raw }
}

module.exports = Ryaml;
