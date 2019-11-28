const { blockScalar4Traverse, literalBlockScalar, literalBlockChoppingScalar } = require('../config');

const getKey = ln => ln.match(/^\s*-?\s*([^\s]+|\".*\"|\'.*\')\s*:/g);

const startWithKey = ln => getKey(ln) !== null;

const endWithScalar = ln => ln.match(/:\s+[\|>][\+\-]\s*$/g) !== null;

const getValue = ln => ln.match(/(?<=:\s+)[^\s]+.*$/g);

const hasNoValue = ln => ln.match(/:\s*$/g) !== null;

const isKeyPair = ln => startWithKey(ln) && !endWithScalar(ln) && getValue(ln) !== null;

const isArray = ln => ln.match(/^\s*-\s+[^-\s].*/g) !== null;

const countIndent = ln => ln.match(/^\s*/g)[0].length;

const countIndentWithHyphen = ln => ln.match(/^\s*-*\s*/g)[0].length;

const replace = (ln, map) => Object
  .keys(map)
  .reduce((retn, k) => retn.replace(new RegExp(k, 'g'), map[k]), ln);

function wrapKeyPair(yamlString) {
  return yamlString
    .split('\n')
    .reduce((a, ln) =>
      isKeyPair(ln)
      ?
        a += getKey(ln) + ` ${literalBlockChoppingScalar}\n` + ' '.repeat(countIndentWithHyphen(ln) + 2) + getValue(ln) + '\n'
      :
        a += ln + '\n'
      , '')
}

function appendBlockScalar(yamlString) {
  const yamlArr = yamlString.split('\n');
  return yamlArr
    .map((x, i) => {
      if (i + 1 < yamlArr.length && startWithKey(x) && hasNoValue(x) && !startWithKey(yamlArr[i + 1]) && !isArray(yamlArr[i + 1]))
        return `${x} ${literalBlockScalar}`;
      return x;
    })
    .join('\n');
}

function unifyBlockScalar(yamlString) {
  let prevIndent = 0;
  return yamlString
    .split('\n')
    .map(x => {
      if (startWithKey(x) || isArray(x)) {
        if (countIndent(x) <= prevIndent) x = replace(x, blockScalar4Traverse);
        prevIndent = countIndentWithHyphen(x);
      }
      return x;
    })
    .join('\n');
}

function patch({ yamlString }) {
  const result = appendBlockScalar(wrapKeyPair(unifyBlockScalar(yamlString)));
  return result;
}

module.exports = { patch_yaml: patch };
