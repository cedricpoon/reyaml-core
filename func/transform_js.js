const jsYaml = require('js-yaml');

function transform_js({ yamlString }) {
  try {
    let o = jsYaml.safeLoadAll(yamlString);
    o = o.length === 1 ? o[0] : o;
    return o;
  } catch (e) {
    return null;
  }
}

module.exports = { transform_js };
