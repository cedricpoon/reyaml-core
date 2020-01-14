function functions () {
  //eslint-disable no-unused-vars

  this.getKey = ln => { const a = ln.match(/[^:]*:/); return a ? a[0] : null };

  this.startWithKey = ln => this.getKey(ln) !== null;

  this.endWithScalar = ln => ln.match(/:\s+[|>][+-]\s*$/) !== null;

  this.getValue = ln => { const a = ln.match(/(:\s+)([^\s]+.*)/); return a && a.length === 3 ? a[2] : null };

  this.hasNoValue = ln => ln.match(/:\s*$/) !== null;

  this.isKeyPair = ln => this.startWithKey(ln) && !this.endWithScalar(ln) && this.getValue(ln) !== null;

  this.isNode = ln => this.startWithKey(ln) || this.isArray(ln);

  this.isString = ln => !this.startWithKey(ln) && !this.isArray(ln);

  this.isArray = ln => ln.match(/^\s*-\s+[^-\s].*/) !== null;

  this.countIndent = ln => ln.match(/^\s*/)[0].length;

  this.countIndentWithHyphen = ln => ln.match(/^\s*-*\s*/)[0].length;

  this.replace = (ln, map) => Object
    .keys(map)
    .reduce((retn, k) => retn.replace(new RegExp(k, 'g'), map[k]), ln);

  this._trLn = (yStr, f) => yStr
    .split('\n')
    .reduce(({ result, prevIndent, isScalar }, ln, i, yamlArr) =>
      !isScalar && this.isNode(ln)
      ?
        {
          result: result + `${f(
            (i - 1 > 0) ? yamlArr[i - 1] : null,
            ln,
            (i + 1 < yamlArr.length) ? yamlArr[i + 1] : null,
            i
          )}\n`,
          prevIndent: this.countIndentWithHyphen(ln),
          isScalar: (i + 1 < yamlArr.length)
            && ((this.isNode(ln) && this.isString(yamlArr[i + 1]))
            || (this.isKeyPair(ln) && this.countIndentWithHyphen(ln) < this.countIndent(yamlArr[i + 1]))
            || (this.startWithKey(ln) && this.endWithScalar(ln)))
        }
      :
        {
          result: result + `${ln}\n`,
          prevIndent,
          isScalar: isScalar && i + 1 < yamlArr.length && prevIndent < this.countIndent(yamlArr[i + 1])
        }
    , { result: '', prevIndent: 0, isScalar: false });

  this.traverseNode = (yamlString, callback) => this._trLn(yamlString, callback).result;

  //eslint-enable no-unused-vars
  return this;
}

module.exports = functions();
