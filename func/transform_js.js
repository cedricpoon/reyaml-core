const jsYaml = require('js-yaml');

function transform_js({ yamlString }) {
  try {
    const a = jsYaml.safeLoadAll(yamlString);
    return a.length === 1 ? a[0] : a;
  } catch (e) {
    return null;
  }
}

module.exports = { transform_js };
