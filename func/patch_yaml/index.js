const { is_parser_ignorable } = require('../count_junk_line');
const fn = require('./fn');

function patch(yamlString) {
  /**
   * Constructor.
   *
   * @param {string} yamlString YAML string.
   */
  this._yamlString = yamlString;

  /* eslint-disable no-unused-vars */

  /**
   * Wrap "foo: bar" to become "foo: `trailingScalar`\n\tbar".
   *
   * @param {number} tabSize size of tab, meant to be soft tab.
   * @param {string} trailingScalar string appending after key and colon.
   * @returns {Object} Immutable patcher object.
   */
  this.wrapKeyPair = ({ tabSize, trailingScalar = '' }) =>
    patch(fn.traverseNode(this._yamlString, (prev, curr, next, i) => {
      if (fn.isKeyPair(curr))
        return `${fn.getKey(curr)} ${trailingScalar}\n` + ' '.repeat(fn.countIndentWithHyphen(curr) + tabSize) + fn.getValue(curr);
      else
        return curr;
    }));

  /**
   * Append block scalar to key-colon.
   *
   * @param {string} blockScalar block scalar to be appended.
   * @returns {Object} Immutable patcher object.
   */
  this.appendBlockScalar = ({ blockScalar }) =>
    patch(fn.traverseNode(this._yamlString, (prev, curr, next, i) => {
      if (next !== null && fn.startWithKey(curr) && fn.hasNoValue(curr) && !fn.startWithKey(next) && !fn.isArray(next))
        return `${curr} ${blockScalar}`;
      else
        return curr
    }));

  /**
   * Remove empty line matching is_parser_ignorable().
   *
   * @returns {Object} Immutable patcher object.
   */
  this.removeEmptyLine = () =>
    patch(
      this._yamlString
        .split('\n')
        .reduce((a, x) => is_parser_ignorable(x) ? a : a += `${x}\n`, '')
    );

  /**
   * Transform all block scalars in `blockScalarMap` into destinating block scalar.
   *
   * @param {Object} blockScalarMap Map between transformee and transformer. Example in config.js
   * @returns {Object} Immutable patcher object.
   */
  this.unifyBlockScalar = ({ blockScalarMap }) => {
    const sanitizedMap = Object.keys(blockScalarMap).reduce((sani, key) => {
      sani[`${fn.sanitizeRegex(key)}\\s*$`] = blockScalarMap[key];
      return sani;
    }, {});
    return patch(fn.traverseNode(this._yamlString, (prev, curr, next, i) => {
      if (fn.startWithKey(curr) && fn.endWithScalar(curr))
        return fn.replace(curr, sanitizedMap);
      return curr;
    }));
  }
  
  /**
   * Patch each key with `postfix`.
   *
   * @param {string} postfix Postfix for each key.
   * @returns {Object} Immutable patcher object.
   */
  this.appendKey = ({ postfix }) =>
    patch(fn.traverseNode(this._yamlString, (prev, curr, next, i) => {
      if (fn.startWithKey(curr)) {
        const _key = fn.getKey(curr);
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
   *
   * @returns {Object} Immutable patcher object.
   */
  this.wipeSingularArray = () => {
    const stack = [];
    const singularIndex = [];
    let indent = -1;
    fn.traverseNode(this._yamlString, (prev, curr, next, i) => {
      const currIndent = fn.countIndentWithHyphen(curr);
      if (currIndent > indent) stack.push({ i: -1, ind: currIndent });
      else if (currIndent < indent) {
        let pop;
        do {
          pop = stack.pop();
          if (pop && pop.i > -1) singularIndex.push(pop.i);
        } while (stack.length > 0 && stack[stack.length - 1].ind !== currIndent);
      }
      if (fn.isArray(curr) && fn.startWithKey(curr)) {
        if (stack[stack.length - 1].i === -1) stack[stack.length - 1].i = i;
        else stack[stack.length - 1].i = -2;
      }
      indent = currIndent;
    });
    const yamlArray = this._yamlString.split('\n');
    singularIndex.push(...stack.filter(x => x.i > -1).map(x => x.i)); // push remaining indices
    singularIndex.forEach(i => {
      yamlArray[i] = yamlArray[i].replace('-', ' ');
    });
    return patch(yamlArray.join('\n'));
  }

  /**
   * Getter of this._yamlString.
   *
   * @returns {string} underlying yamlString.
   */
  this.result = () => this._yamlString;

  /* eslint-enable no-unused-vars */

  return this;
}

const patchProfileThunk = ({ blockScalarTranslation, size, symbol, wrapKeyPairScalar, appendBlockScalar }) => {
  const patchProfile = {
    default: ({ yamlString }) => yamlString,
    d3Tree: ({ yamlString }) =>
      patch(yamlString)
        .removeEmptyLine()
        .wipeSingularArray()
        .unifyBlockScalar({ blockScalarMap: blockScalarTranslation })
        .wrapKeyPair({ tabSize: size.tabSize, trailingScalar: wrapKeyPairScalar })
        .appendKey({ postfix: symbol.keyPostfix })
        .appendBlockScalar({ blockScalar: appendBlockScalar })
        .result()
  };
  return patchProfile
}

module.exports = {
  patcher: patch,
  patch_yaml: patchProfileThunk
};
