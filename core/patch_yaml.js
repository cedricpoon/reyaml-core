const { blockScalar4Traverse, literalBlockScalar, literalBlockChoppingScalar } = require('../config');

const getKey = ln => ln.match(/^\s*-?\s*([^\s]+|\".*\"|\'.*\')\s*:/g);

const startWithKey = ln => getKey(ln) !== null;

const endWithScalar = ln => ln.match(/:\s+[\|>][\+\-]\s*$/g) !== null;

const getValue = ln => ln.match(/(?<=:\s+)[^\s]+.*/g);

const hasNoValue = ln => ln.match(/:\s*$/g) !== null;

const isKeyPair = ln => startWithKey(ln) && !endWithScalar(ln) && getValue(ln) !== null;

const isNode = ln => (startWithKey(ln) || isArray(ln)) && !endWithScalar(ln)

const isArray = ln => ln.match(/^\s*-\s+[^-\s].*/g) !== null;

const countIndent = ln => ln.match(/^\s*/g)[0].length;

const countIndentWithHyphen = ln => ln.match(/^\s*-*\s*/g)[0].length;

const replace = (ln, map) => Object
  .keys(map)
  .reduce((retn, k) => retn.replace(new RegExp(k, 'g'), map[k]), ln);

const _trLn = (yStr, f) => yStr
  .split('\n')
  .reduce(({ result, prevIndent }, ln, i, yamlArr) =>
    i === 0 || isNode(yamlArr[i - 1]) || countIndent(ln) < prevIndent ?
      {
        result: result + `${f(
          (i - 1 > 0) ? yamlArr[i - 1] : null,
          ln,
          (i + 1 < yamlArr.length) ? yamlArr[i + 1] : null
        )}\n`,
        prevIndent: countIndentWithHyphen(ln)
      }
    :
      { result: result + `${ln}\n`, prevIndent }
  , { result: '', prevIndent: 0 });

const traverseLine = (yamlString, callback) => {
  const { result, prevIndent } = _trLn(yamlString, callback);
  return result;
}

function wrapKeyPair(yamlString) {
  return traverseLine(yamlString, (prev, curr, next) => {
    if (isKeyPair(curr))
      return  `${getKey(curr)} ${literalBlockChoppingScalar}\n` + ' '.repeat(countIndentWithHyphen(curr) + 2) + getValue(curr);
    else
      return curr;
  });
}

function appendBlockScalar(yamlString) {
  return traverseLine(yamlString, (prev, curr, next) => {
    if (next !== null && startWithKey(curr) && hasNoValue(curr) && !startWithKey(next) && !isArray(next))
      return `${curr} ${literalBlockScalar}`;
    else
      return curr
  });
}

function unifyBlockScalar(yamlString) {
  return traverseLine(yamlString, (prev, curr, next) => {
    if (startWithKey(curr) || isArray(curr))
      return replace(curr, blockScalar4Traverse);
    return curr;
  });
}

function patch({ yamlString }) {
  let result = appendBlockScalar(wrapKeyPair(unifyBlockScalar(yamlString)));
  result = result.replace(/\n*$/g, '');
  return result;
}

module.exports = { patch_yaml: patch };
