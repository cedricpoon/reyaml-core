const { blockScalarTranslation, literalBlockScalar, literalBlockChoppingScalar, size, symbol } = require('../config');

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
          (i + 1 < yamlArr.length) ? yamlArr[i + 1] : null,
          i
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
/**
 * Constructor.
 * @param {string} yamlString YAML string.
 */
  this._yamlString = yamlString;
/* eslint-disable no-unused-vars */
/**
 * Wrap "foo: bar" to become "foo: `trailingScalar`\n\tbar".
 * @param {int} tabSize size of tab, meant to be soft tab.
 * @param {string} trailingScalar string appending after key and colon.
 * @returns {object} Immutable patcher object.
 */
  this.wrapKeyPair = ({ tabSize, trailingScalar }) =>
    patch(traverseNode(this._yamlString, (prev, curr, next, i) => {
      if (isKeyPair(curr))
        return `${getKey(curr)} ${trailingScalar}\n` + ' '.repeat(countIndentWithHyphen(curr) + tabSize) + getValue(curr);
      else
        return curr;
    }));
/**
 * Append block scalar to key-colon.
 * @param {string} blockScalar block scalar to be appended.
 * @returns {object} Immutable patcher object.
 */
  this.appendBlockScalar = ({ blockScalar }) =>
    patch(traverseNode(this._yamlString, (prev, curr, next, i) => {
      if (next !== null && startWithKey(curr) && hasNoValue(curr) && !startWithKey(next) && !isArray(next))
        return `${curr} ${blockScalar}`;
      else
        return curr
    }));
/**
 * Remove empty line matching is_parser_ignorable().
 * @returns {object} Immutable patcher object.
 */
  this.removeEmptyLine = () =>
    patch(
      this._yamlString
        .split('\n')
        .reduce((a, x) => is_parser_ignorable(x) ? a : a += `${x}\n`, '')
    );
/**
 * Transform all block scalars in `blockScalarMap` into destinating block scalar.
 * @param {object} blockScalarMap Map between transformee and transformer. Example in config.js
 * @returns {object} Immutable patcher object.
 */
  this.unifyBlockScalar = ({ blockScalarMap }) =>
    patch(traverseNode(this._yamlString, (prev, curr, next, i) => {
      if (startWithKey(curr) || isArray(curr))
        return replace(curr, blockScalarMap);
      return curr;
    }));
/**
 * Patch each key with `postfix`.
 * @param {string} postfix Postfix for each key.
 * @returns {object} Immutable patcher object.
 */
  this.appendKey = ({ postfix }) =>
    patch(traverseNode(this._yamlString, (prev, curr, next, i) => {
      if (startWithKey(curr)) {
        const _key = getKey(curr);
        let separator = ':';
        if (_key.lastIndexOf('":') !== -1)
          separator = '":';
        else if (_key.lastIndexOf('\':') !== -1)
          separator = '\':';
        return `${_key.substr(0, _key.lastIndexOf(separator))}${postfix}${curr.substr(_key.lastIndexOf(separator))}`;
      }
      else
        return curr
    }));
/**
 * Delete all array in YAML with size 1.
 * @returns {object} Immutable patcher object.
 */
  this.wipeSingularArray = () => {
    const stack = [];
    let indent = -1;
    let singularIndex = [];
    traverseNode(this._yamlString, (prev, curr, next, i) => {
      const currIndent = countIndentWithHyphen(curr);
      if (currIndent > indent) stack.push({ i: -1, ind: currIndent });
      else if (currIndent < indent) {
        let pop;
        do {
          pop = stack.pop();
          if (pop && pop.i > -1) singularIndex.push(pop.i);
        } while (stack.length > 0 && stack[stack.length - 1].ind !== currIndent);
      }
      if (isArray(curr) && startWithKey(curr)) {
        if (stack[stack.length - 1].i === -1) stack[stack.length - 1].i = i;
        else stack[stack.length - 1].i = -2;
      }
      indent = currIndent;
    });
    const yamlArray = this._yamlString.split('\n');
    singularIndex.forEach(i => {
      yamlArray[i] = yamlArray[i].replace('-', ' ');
    });
    return patch(yamlArray.join('\n'));
  }
/**
 * Getter of this._yamlString.
 * @returns {string} underlying yamlString.
 */
  this.result = () => this._yamlString;
/* eslint-enable no-unused-vars */
  return this;
}

const patch_profile = {
  default: ({ yamlString }) => yamlString,
  d3Tree: ({ yamlString }) =>
    patch(yamlString)
      .removeEmptyLine()
      .wipeSingularArray()
      .unifyBlockScalar({ blockScalarMap: blockScalarTranslation })
      .wrapKeyPair({ tabSize: size.tabSize, trailingScalar: literalBlockChoppingScalar })
      .appendKey({ postfix: symbol.keyPostfix })
      .appendBlockScalar({ blockScalar: literalBlockScalar })
      .result()
};

module.exports = {
  patcher: patch,
  patch_yaml: patch_profile
};
