const { count_junk_line } = require('../core/count_junk_line');
const { transform_js } = require('../core/transform_js');
const Rjson = require('./Rjson');

class Ryaml {
  constructor(yaml) {
    this.yaml = yaml;
  }

  countJunkLine({ lineNo }) {
    return count_junk_line({ sourceYaml: this.yaml, lineNo });
  }

  get json() {
    return new Rjson(transform_js({ yamlString: this.yaml }));
  }

  get raw() { return this.yaml; }
}

module.exports = Ryaml;
