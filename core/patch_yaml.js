const { blockScalar4Traverse } = require('../config');

const isKeyPair = ln => ln.match(/^\s*-?\s*([^\s]+|\".*\"|\'.*\')\s*:/g) !== null;

const isArray = ln => ln.match(/^\s*-\s+[^-\s].*/g) !== null;

const countIndent = ln => ln.match(/^\s*/g)[0].length;

const countIndentWithHyphen = ln => ln.match(/^\s*-*\s*/g)[0].length;

const replace = (ln, map) => Object
  .keys(map)
  .reduce((retn, k) => retn.replace(new RegExp(k, 'g'), map[k]), ln);

function appendBlockScalar(yamlString) {
  const yamlArr = yamlString.split('\n');
  return yamlArr
    .forEach((x, i) => {
      if (i + 1 < yamlArr.length && isKeyPair(x) && !isKeyPair(yamlArr[i + 1]) && !isArray(yamlArr[i + 1]))
        yamlArr[i + 1] += ' |+';
    })
    .join('\n');
}

function unifyBlockScalar(yamlString) {
  let prevIndent = 0;
  return yamlString
    .split('\n')
    .map(x => {
      if (isKeyPair(x) || isArray(x)) {
        if (countIndent(x) <= prevIndent) x = replace(x, blockScalar4Traverse);
        prevIndent = countIndentWithHyphen(x);
      }
      return x;
    })
    .join('\n');
}

function patch({ yamlString }) {
  const result = appendBlockScalar(unifyBlockScalar(yamlString));
  return result;
}

module.exports = { patch_yaml: patch };
