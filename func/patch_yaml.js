const { blockScalar4Traverse, literalBlockScalar, literalBlockChoppingScalar, tabSize } = require('../config');

const { is_parser_ignorable } = require('./count_junk_line');

const getKey = ln => ln.match(/^\s*-?\s*([^\s]+|\".*\"|\'.*\')\s*:/g);

const startWithKey = ln => getKey(ln) !== null;

const endWithScalar = ln => ln.match(/:\s+[\|>][\+\-]\s*$/g) !== null;

const getValue = ln => ln.match(/(?<=:\s+)[^\s]+.*/g);

const hasNoValue = ln => ln.match(/:\s*$/g) !== null;

const isKeyPair = ln => startWithKey(ln) && !endWithScalar(ln) && getValue(ln) !== null;

const isNode = ln => startWithKey(ln) || isArray(ln);

const isString = ln => !startWithKey(ln) && !isArray(ln);

const isArray = ln => ln.match(/^\s*-\s+[^-\s].*/g) !== null;

const countIndent = ln => ln.match(/^\s*/g)[0].length;

const countIndentWithHyphen = ln => ln.match(/^\s*-*\s*/g)[0].length;

const replace = (ln, map) => Object
  .keys(map)
  .reduce((retn, k) => retn.replace(new RegExp(k, 'g'), map[k]), ln);

const _trLn = (yStr, f) => yStr
  .split('\n')
  .reduce(({ result, prevIndent, isScalar }, ln, i, yamlArr) =>
    !isScalar && isNode(ln)
    ?
      {
        result: result + `${f(
          (i - 1 > 0) ? yamlArr[i - 1] : null,
          ln,
          (i + 1 < yamlArr.length) ? yamlArr[i + 1] : null
        )}\n`,
        prevIndent: countIndentWithHyphen(ln),
        isScalar: (i + 1 < yamlArr.length)
          && ((isNode(ln) && isString(yamlArr[i + 1]))
          || (isKeyPair(ln) && countIndent(yamlArr[i + 1]))
          || (startWithKey(ln) && endWithScalar(ln)))
      }
    :
      {
        result: result + `${ln}\n`,
        prevIndent,
        isScalar: isScalar && i + 1 < yamlArr.length && prevIndent < countIndent(yamlArr[i + 1])
      }
  , { result: '', prevIndent: 0, isScalar: false });

const traverseNode = (yamlString, callback) => _trLn(yamlString, callback).result;

function wrapKeyPair(yamlString) {
  return traverseNode(yamlString, (prev, curr, next) => {
    if (isKeyPair(curr))
      return  `${getKey(curr)} ${literalBlockChoppingScalar}\n` + ' '.repeat(countIndentWithHyphen(curr) + tabSize) + getValue(curr);
    else
      return curr;
  });
}

function appendBlockScalar(yamlString) {
  return traverseNode(yamlString, (prev, curr, next) => {
    if (next !== null && startWithKey(curr) && hasNoValue(curr) && !startWithKey(next) && !isArray(next))
      return `${curr} ${literalBlockScalar}`;
    else
      return curr
  });
}

function removeEmptyLine(yamlString) {
  return yamlString
    .split('\n')
    .reduce((a, x) => is_parser_ignorable(x) ? a : a += `${x}\n`, '');
}

function unifyBlockScalar(yamlString) {
  return traverseNode(yamlString, (prev, curr, next) => {
    if (startWithKey(curr) || isArray(curr))
      return replace(curr, blockScalar4Traverse);
    return curr;
  });
}

function patch({ yamlString }) {
  let result = appendBlockScalar(wrapKeyPair(unifyBlockScalar(removeEmptyLine(yamlString))));
  result = result.replace(/\n*$/g, '');
  return result;
}

module.exports = { patch_yaml: patch };
