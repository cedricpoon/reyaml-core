const { count_junk_line, is_junk_line } = require('../func/count_junk_line');
const { transform_js } = require('../func/transform_js');
const { patcher, patch_yaml } = require('../func/patch_yaml');
const Rjson = require('./Rjson');

class Ryaml {
/**
 * Determine whenever it is a junk line.
 * @param {string} line String to be determined.
 * @returns {boolean} Is junk line or not.
 */
  static isJunkLine({ line }) {
    return is_junk_line(line);
  }
/**
 * Constructor.
 * @param {string} raw YAML string.
 */
  constructor(raw) {
    this.raw = raw;
  }
/**
 * Count number of junk lines (e.g. empty line) in YAML string.
 * @param {int} lineNo For gettng junk line before given line number.
 * @returns {int} Number of junk lines.
 */
  countJunkLine({ lineNo }) {
    return count_junk_line({ sourceYaml: this.raw, lineNo });
  }
/**
 * Patch YAML string with given patcher function.
 * @param {function} patcher => patcher.xxx().yyy() For actual patching the original YAML string.
 * @returns {object} Immutable Ryaml with new YAML string.
 */
  patch(p) {
    return new Ryaml(p(patcher(this.raw)).result());
  }
/**
 * Convert to Rjson object.
 * @param {string} profile To let patch_yaml know which profile should it use for patching YAML string.
 * @returns {object} Immutable Rjson.
 */
  toRjson({ profile = 'default' } = {}) {
    return new Rjson(transform_js({ yamlString: patch_yaml[profile]({ yamlString: this.raw }) }));
  }
}

module.exports = Ryaml;
