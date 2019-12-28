const { blockScalar4Traverse, literalBlockScalar, literalBlockChoppingScalar, tabSize, keyPostfix } = require('../config');

const { is_parser_ignorable } = require('./count_junk_line');

const getKey = ln => { const a = ln.match(/[^:]*:/); return a ? a[0] : null };

const startWithKey = ln => getKey(ln) !== null;

const endWithScalar = ln => ln.match(/:\s+[|>][+-]\s*$/) !== null;

const getValue = ln => { const a = ln.match(/(:\s+)([^\s]+.*)/); return a && a.length === 3 ? a[2] : null };

const hasNoValue = ln => ln.match(/:\s*$/) !== null;

const isKeyPair = ln => startWithKey(ln) && !endWithScalar(ln) && getValue(ln) !== null;

const isNode = ln => startWithKey(ln) || isArray(ln);

const isString = ln => !startWithKey(ln) && !isArray(ln);

const isArray = ln => ln.match(/^\s*-\s+[^-\s].*/) !== null;

const countIndent = ln => ln.match(/^\s*/)[0].length;

const countIndentWithHyphen = ln => ln.match(/^\s*-*\s*/)[0].length;

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
          || (isKeyPair(ln) && countIndentWithHyphen(ln) < countIndent(yamlArr[i + 1]))
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

function patch(yamlString) {
  // Constructor
  this.yamlString = yamlString;

  /* eslint-disable no-unused-vars */
  this.wrapKeyPair = () => {
    return patch(traverseNode(this.yamlString, (prev, curr, next) => {
      if (isKeyPair(curr))
        return `${getKey(curr)} ${literalBlockChoppingScalar}\n` + ' '.repeat(countIndentWithHyphen(curr) + tabSize) + getValue(curr);
      else
        return curr;
    }));
  }

  this.appendBlockScalar = () => {
    return patch(traverseNode(this.yamlString, (prev, curr, next) => {
      if (next !== null && startWithKey(curr) && hasNoValue(curr) && !startWithKey(next) && !isArray(next))
        return `${curr} ${literalBlockScalar}`;
      else
        return curr
    }));
  }

  this.removeEmptyLine = () => {
    return patch(
      this.yamlString
        .split('\n')
        .reduce((a, x) => is_parser_ignorable(x) ? a : a += `${x}\n`, '')
    );
  }

  this.unifyBlockScalar = () => {
    return patch(traverseNode(this.yamlString, (prev, curr, next) => {
      if (startWithKey(curr) || isArray(curr))
        return replace(curr, blockScalar4Traverse);
      return curr;
    }));
  }

  this.appendKey = () => {
    return patch(traverseNode(this.yamlString, (prev, curr, next) => {
      if (startWithKey(curr)) {
        const _key = getKey(curr);
        let separator = ':';
        if (_key.lastIndexOf('":') !== -1)
          separator = '":';
        else if (_key.lastIndexOf('\':') !== -1)
          separator = '\':';
        return `${_key.substr(0, _key.lastIndexOf(separator))}${keyPostfix}${curr.substr(_key.lastIndexOf(separator))}`;
      }
      else
        return curr
    }));
  }

  this.result = () => this.yamlString;
  /* eslint-enable no-unused-vars */

  return this;
}

module.exports = {
  patch_yaml: ({ yamlString }) =>
    patch(yamlString)
      .removeEmptyLine()
      .unifyBlockScalar()
      .wrapKeyPair()
      .appendBlockScalar()
      .appendKey()
      .result()
};
