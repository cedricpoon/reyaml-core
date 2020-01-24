(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rc = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const patchD3 = ({ attributes, color }) => ({
  attributes: { ...attributes },
  nodeSvgShape: {
    shapeProps: {
      ...color
    },
  },
});

const blockScalar = {
  literalKeep: '|+',
  literalStrip: '|-',
  foldedKeep: '>+',
  foldedStrip: '>-'
};

const config = {
  symbol: { /* default symbol used by profile `d3Tree` */
    section: '§',
    sectionLeft: '◦§',
    sectionRight: '§◦',
    keyPostfix: '⏎',
  },
  size: { /* numeric variables */
    tabSize: 2,
    maxStringSize: 15, /* maximum length of key and content in JSON keypair */
  },
  wrapKeyPairScalar: blockScalar.literalStrip, /* scalar for wrapKeyPair() in profile `d3Tree` */
  appendBlockScalar: blockScalar.literalKeep, /* scalar for appendBlockScalar() in profile `d3Tree` */
  blockScalarTranslation: { /* scalar map for unifyBlockScalar() in profile `d3Tree` */
    [blockScalar.literalStrip]: blockScalar.literalKeep,
    [blockScalar.foldedStrip]: blockScalar.literalKeep,
    [blockScalar.foldedKeep]: blockScalar.literalKeep
  },
  nodeMap: { /* default D3 hierarchical tree node */
    object: {
      d3: { attributes: {}, nodeSvgShape: { shape: 'circle', shapeProps: { r: 10 } } }
    },
    array: {
      d3: { attributes: {}, nodeSvgShape: { shape: 'rect', shapeProps: { width: 15, height: 15, x: -10, y: -5 } } }
    }
  },
  marker: { name: '*', content: '**' }, /* intermediate marking structure for JSON */
  markerMap: {  /* types of marking to be applied in D3 transformation */
    highlight: {  /* active line indicator */
      name: 'highlight',
      d3: patchD3({ color: { fill: 'red', stroke: 'red' } }),
    },
    truncatedDown: {
      name: 'truncatedDown',
      d3: patchD3({ attributes: { '': '⬇' }, color: { fill: 'lightgoldenrodyellow', stroke: 'grey' } }),
    },
    truncatedUp: {
      name: 'truncatedUp',
      d3: patchD3({ attributes: { '': '⬆' }, color: { fill: 'lightgoldenrodyellow', stroke: 'grey' } }),
    },
    truncatedLeft: {
      name: 'truncatedLeft',
      d3: patchD3({ attributes: { '': '⬅' }, color: { fill: 'lightcyan', stroke: 'grey' } }),
    },
    truncatedRight: {
      name: 'truncatedRight',
      d3: patchD3({ attributes: { '': '⮕' }, color: { fill: 'lightcyan', stroke: 'grey' } }),
    },
  }
};

module.exports = config;

},{}],2:[function(require,module,exports){
const Ryaml = require('./lib/object/Ryaml');
const Rjson = require('./lib/object/Rjson');

module.exports = { Ryaml, Rjson };

},{"./lib/object/Rjson":12,"./lib/object/Ryaml":13}],3:[function(require,module,exports){
const isArraySeparator = ln => ln.match(/^-{3,}/) !== null;

const isComment = ln => ln.match(/^\s*#+/) !== null;

const isWhiteline = ln => ln.match(/^\s*$/) !== null;

const isJunk = ln => isWhiteline(ln) | isComment(ln) | isArraySeparator(ln);

const isParserIgnorable = ln => isWhiteline(ln) | isComment(ln);

const count = ({ sourceYaml, lineNo }) => {
  const arr = sourceYaml.split('\n');
  return arr.reduce((acc, curr, i) => acc += (isJunk(curr) && (lineNo == null || i <= lineNo)) ? 1 : 0, 0);
}

module.exports = {
  count_junk_line: count,
  is_junk_line: isJunk,
  is_parser_ignorable: isParserIgnorable
};

},{}],4:[function(require,module,exports){
function count ({ sourceObj }) {
  const rc = obj => typeof obj === 'object' ? Object.keys(obj).reduce((acc, curr) => {
    if (Array.isArray(obj)) return acc + rc(obj[curr])
    else if (typeof obj[curr] === 'object') return ++acc + rc(obj[curr])
    else return ++acc
  }, 0) : 0;

  return rc(sourceObj);
}

module.exports = { count_key: count };

},{}],5:[function(require,module,exports){
function pureInsert({ key, jsSource, jsNew }) {
  const traverser = item => Object.keys(item).filter(k => k == key).map(k => Object.assign(item[k], jsNew));
  if (Array.isArray(jsSource))
    jsSource
      .filter(item => item != null)
      .map(traverser);
  else
    traverser(jsSource);
  return jsSource;
}

module.exports = { insert: pureInsert };

},{}],6:[function(require,module,exports){
const traverse = require('../utils/traverse');

function markThunk({ marker, markerMap }) {
  function appendAsterisk(obj, name) {
    const x = obj[name];
    obj[name] = {};
    obj[name][marker.name] = markerMap.highlight.name;
    obj[name][marker.content] = x;
  }

  function mark({ sourceObj, lineNo }) {
    if (lineNo !== null && sourceObj !== null)
      traverse(sourceObj)
        .toLineNo(lineNo)
        .then((o, name) => { appendAsterisk(o, name) });
    return sourceObj;
  }

  return mark;
}

module.exports = { mark_line: markThunk };

},{"../utils/traverse":16}],7:[function(require,module,exports){
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

  // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
  this.sanitizeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  this.replace = (ln, map) => Object
    .keys(map)
    .reduce((retn, k) => retn.replace(new RegExp(k), map[k]), ln);

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

},{}],8:[function(require,module,exports){
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

},{"../count_junk_line":3,"./fn":7}],9:[function(require,module,exports){
const limitString = (ln, n) => (ln.length > n) ? ln.substr(0, n-1) + '...' : ln;

function transformD3Thunk({ marker, markerMap, nodeMap, symbol, size }) {
  
  function transform_mark({ sourceObj, key }) {
    if (sourceObj[key] && Object.prototype.hasOwnProperty.call(sourceObj[key], marker.name)) {
      if (Object.prototype.hasOwnProperty.call(sourceObj[key], marker.content))
        return { marked: true, type: sourceObj[key][marker.name], pureContent: sourceObj[key][marker.content] };
      else
        return { marked: true, type: sourceObj[key][marker.name], pureContent: null };
    } else {
      return { marked: false, type: null, pureContent: sourceObj[key] };
    }
  }

  function transform_d3_master({ sourceObj, nameHandler }) {
    if (sourceObj != null && Object.keys(sourceObj).length > 1)
      return transform_d3_from_object({ sourceObj: { [symbol.section]: sourceObj }, nameHandler });
    else
      return transform_d3_from_object({ sourceObj, nameHandler });
  }

  function transform_d3_from_object({ sourceObj, nameHandler }) {
    const a = [];
    if (sourceObj != null) {
      Object
        .keys(sourceObj)
        .forEach(key => {
          const { marked, type, pureContent } = transform_mark({ sourceObj, key });
          const o = JSON.parse(JSON.stringify(Array.isArray(sourceObj) ? nodeMap.array.d3 : nodeMap.object.d3));
          if (marked) {
            const patcher = markerMap[type].d3;
            o.attributes = { ...o.attributes, ...patcher.attributes };
            o.nodeSvgShape.shapeProps = { ...o.nodeSvgShape.shapeProps, ...patcher.nodeSvgShape.shapeProps };
          }
          o.name = nameHandler(Array.isArray(sourceObj) ? `[${key}]` : key);
          a.push(o);
          if (typeof pureContent === 'object') {
            const na = transform_d3_from_object({ sourceObj: pureContent, nameHandler });
            o.children = na;
          } else {
            o.attributes = {};
            o.attributes[""] = limitString(pureContent, size.maxStringSize);
          }
        });
    }
    return a;
  }

  const transform_d3_profile = {
    default: ({ sourceObj }) => transform_d3_master({
      sourceObj,
      nameHandler: x => limitString(x, size.maxStringSize)
    }),
    d3Tree: ({ sourceObj }) => transform_d3_master({
      sourceObj,
      nameHandler: x => limitString(x.slice(-1) === symbol.keyPostfix ? `${x.slice(0, -1)} ` : x, size.maxStringSize)
    })
  };

  return transform_d3_profile;
}
module.exports = { transform_d3: transformD3Thunk };

},{}],10:[function(require,module,exports){
(function (global){
const jsYaml = (typeof window !== "undefined" ? window['jsyaml'] : typeof global !== "undefined" ? global['jsyaml'] : null);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
const traverse = require('../utils/traverse');
const modify = require('../utils/modify');
const Traverse = traverse();  // get class

function truncateThunk({ marker, markerMap, symbol }) {
  let trimMark = true; // global mutable variable

  function truncChildren({ sourceObj, level }) {
    const _trunc = (o, lv) => Object.keys(o).map(name => {
      if (o[name]) {
        if (typeof o[name] === 'object' && lv > 0)
          _trunc(
            o[name],
            lv - (Object.prototype.hasOwnProperty.call(o[name], marker.name) ? 0 : 1)
          );
        else if (typeof o[name] === 'object' && trimMark) {
          o[name] = {};
          o[name][marker.name] = markerMap.truncatedDown.name;
        } else if (typeof o[name] === 'object') {
          o[name] = null;
        }
      }
    });
    _trunc(sourceObj, level);
  }

  function findParent({ sourceObj, obj, level }) {
    for (let i = 0; i < level; i++) {
      let topMost = true;
      traverse(sourceObj)
        .toObject(obj)
        // eslint-disable-next-line no-unused-vars
        .then((o, name) => { topMost = false; obj = o; });
      if (topMost) return { parent: obj, i: level - i };
    }
    return { parent: obj, i: 0 };
  }

  function vertically({ level, sourceObj, o }) {
    let { parent, i } = findParent({  // `o` as parent
      sourceObj,
      obj: o,
      level: Object.prototype.hasOwnProperty.call(o, marker.name) ? level + 1 : level
    });
    if (sourceObj !== parent && Object.keys(parent).length > 1 && trimMark) { // case of uplifted dummy parent
      const x = {};
      x[marker.name] = markerMap.truncatedUp.name;
      if (Array.isArray(parent))
        x[marker.content] = [ ...parent ];
      else
        x[marker.content] = { ...parent };
      parent = x;
      i--;  // compensate an extra level created by truncatedUp
    }
    sourceObj = parent;
    truncChildren({ sourceObj, level: level * 2 - i }); // `o` as parent
    return sourceObj;
  }

  const markTrim = (o, sym, type) => {
    if (trimMark) {
      const o2a = Array.isArray(o) ? {
        [marker.name]: type.name
      } : {
        [sym]: { [marker.name]: type.name }
      };
      if (sym === symbol.sectionLeft)
        modify(o).prepend(o2a);
      else
        modify(o).append(o2a);
    }
  };

  function trimLHS({ o, names, siblingSize, pivot }) {
    let flg = false;
    for (let i = 0; i < pivot - siblingSize; i++) { // handle excessive LHS
      delete o[names[i]];
      flg = true;
    }
    if (flg) markTrim(o, symbol.sectionLeft, markerMap.truncatedLeft); // left arrow
  }

  function trimChildrenFromLHS({ o, names, siblingSize, pivot }) {
    let retainSize = 0;
    let flg = false;

    for (let i = pivot - siblingSize > 0 ? pivot - siblingSize : 0; i < pivot; i++) // handle remaining LHS
      if (o[names[i]])
        traverse(o[names[i]])
          .eachInodes(Traverse.from.RIGHT_TO_LEFT)
          .whenNextLevel(o2 => {
            retainSize = 0; // reset retainment
            if (flg) markTrim(o2, symbol.sectionLeft, markerMap.truncatedLeft); // left arrow
            flg = false; // reset flag
          })
          .then((o2, name2) => {
            if (retainSize++ >= siblingSize) {
              delete o2[name2];
              flg = true;
            }
          });
  }

  function trimRHS({ o, names, siblingSize, pivot }) {
    let flg = false;
    for (let i = names.length - 1; i > pivot + siblingSize; i--) { // handle excessive RHS
      delete o[names[i]];
      flg = true;
    }
    if (flg) markTrim(o, symbol.sectionRight, markerMap.truncatedRight); // right arrow
  }

  function trimChildrenFromRHS({ o, names, siblingSize, pivot }) {
    let retainSize = 0;
    let flg = false;

    for (let i = pivot + siblingSize < names.length ? pivot + siblingSize : names.length - 1; i > pivot; i--) // handle remaining RHS
      if (o[names[i]])
        traverse(o[names[i]])
          .eachInodes(Traverse.from.LEFT_TO_RIGHT)
          .whenNextLevel(o2 => {
            retainSize = 0; // reset retainment
            if (flg) markTrim(o2, symbol.sectionRight, markerMap.truncatedRight); // right arrow
            flg = false; // reset flag
          })
          .then((o2, name2) => {
            if (retainSize++ >= siblingSize) {
              delete o2[name2];
              flg = true;
            }
          });
  }

  function truncSiblings({ o, name, siblingSize }) {
    const names = Object.keys(o);
    const pivot = names.findIndex(x => x === name);

    trimLHS({ o, names, siblingSize, pivot });
    trimChildrenFromLHS({ o, names, siblingSize, pivot });
    trimRHS({ o, names, siblingSize, pivot });
    trimChildrenFromRHS({ o, names, siblingSize, pivot });
  }

  function horizontally({ siblingSize, sourceObj, targetObj }) {
    traverse(sourceObj)
      .eachInodesWithObject(targetObj)
      .then((o, name) => {
        if (!Object.prototype.hasOwnProperty.call(o, marker.name))
          truncSiblings({ o, name, siblingSize });
      });
    return sourceObj;
  }

  function truncate({ sourceObj, level, siblingSize, lineNo, trimMark: _trimMark }) {
    trimMark = _trimMark; // set global mutable variable
    
    if (level !== null && sourceObj !== null)
      traverse(sourceObj)
        .toLineNo(lineNo)
        .then((o, name, _self) => {
          if (name === marker.content || name === marker.name) {
            const r = _self.toObject(o).return; // if marked backtrack 1 level
            o = r.o;
            name = r.name;
          }
          if (level >= 0)
            sourceObj = vertically({ level, sourceObj, o });  // apply leveling rule
          if (siblingSize >= 0) {
            if (Object.prototype.hasOwnProperty.call(o[name], marker.name)
                && o[name][marker.content]
                && typeof o[name][marker.content] === 'object') // lineNo must be object
            {
              const { o: o2, name: name2 } = traverse(o[name][marker.content]).toDeepestTerminal(Traverse.to.MIDDLE).return; // deepest terminal of lineNo
              sourceObj = horizontally({ siblingSize, sourceObj, targetObj: o2 }); // apply sibling rule to deepest inode containing o
              truncSiblings({ o: o2, name: name2, siblingSize }); // apply sibling rule to deepest terminals
            } else {
              sourceObj = horizontally({ siblingSize, sourceObj, targetObj: o[name] }); // apply sibling rule on leveled tree
              truncSiblings({ o, name, siblingSize }); // apply sibling rule to deepest terminals
            }
          }
        });
    return sourceObj;
  }

  return truncate;
}
module.exports = { truncate: truncateThunk };

},{"../utils/modify":14,"../utils/traverse":16}],12:[function(require,module,exports){
const config = require('../../config');
const { insert } = require('../func/insert');
const { transform_d3 } = require('../func/transform_d3');
const { mark_line } = require('../func/mark_line');
const { count_key } = require('../func/count_key');
const { truncate } = require('../func/truncate');
const traverse = require('../utils/traverse');
const modify = require('../utils/modify');

class Rjson {
  /**
   * Constructor.
   *
   * @param {Object} raw JSON Object.
   * @param {Object} env Immutable environment setup using config.js as default.
   */
  constructor(raw, env = config) {
    this._raw = raw;
    this._config = JSON.parse(JSON.stringify(env));
  }

  /**
   * Clone this._raw via stringify-parsing.
   *
   * @returns {Object} Immutable Rjson.
   */
  clone() {
    return new Rjson(JSON.parse(JSON.stringify(this._raw)));
  }

  /**
   * Insert "insertee" inside every "key" in object hierarchy.
   *
   * @param {string} key Key of keypair in object.
   * @param {Object} insertee Immutable Rjson to be inserted.
   * @returns {Object} Immutable Rjson.
   */
  insert({ key, insertee }) {
    return new Rjson(insert({ key, jsSource: this.clone().raw, jsNew: insertee.clone().raw }))
  }

  /**
   * Transform raw object on active YAML line to target marked form.
   *
   * @param {number} lineNo Active YAML line number for indicating which object in raw object hierarchy to be transformed.
   * @returns {Object} Immutable Rjson.
   */
  markLine({ lineNo }) {
    return new Rjson(mark_line({ ...this._config })({ sourceObj: this.clone().raw, lineNo }))
  }

  /**
   * Truncate raw object hierarchy pivoted to object with lineNo, vertically by level, horizontally by siblingSize.
   *
   * @param {number} level Retain N level upwards N level downwards.
   * @param {number} siblingSize Retain N left siblings N right siblings.
   * @param {number} lineNo Pivot to lineNo for trimming.
   * @param {boolean} trimMark Include marking of regarding trim.
   * @returns {Object} Immutable Rjson.
   */
  truncate({ level, siblingSize, lineNo, trimMark = true }) {
    return new Rjson(truncate({ ...this._config })({ sourceObj: this.clone().raw, lineNo, level, siblingSize, trimMark }));
  }

  /**
   * Traverse raw object.
   *
   * @param {Function} traverser => traverser.toXXX().then() Actual traverse using traverse() with clone of raw object.
   * @returns {Object} Immutable Rjson.
   */
  traverse(t) {
    return new Rjson(t(traverse(this.clone().raw)).self);
  }

  /**
   * Modify raw object.
   *
   * @param {Function} modifier => modifier.xxx().yyy() Modify using modify() with clone of raw object.
   * @returns {Object} Immutable Rjson.
   */
  modify(m) {
    return new Rjson(m(modify(this.clone().raw)).self);
  }

  /**
   * Convert to D3 structured object.
   *
   * @returns {Object} JSON object in D3 structure.
   */
  toD3({ profile = 'default' } = {}) {
    return transform_d3({ ...this._config })[profile]({ sourceObj: this._raw });
  }

  /**
   * Count number of keys in raw object.
   *
   * @returns {number} Number of keys in raw object.
   */
  get keyCount() { return count_key({ sourceObj: this._raw }); }
  
  /**
   * Getter for raw.
   *
   * @returns {Object} this._raw.
   */
  get raw() { return this._raw }
}

module.exports = Rjson;

},{"../../config":1,"../func/count_key":4,"../func/insert":5,"../func/mark_line":6,"../func/transform_d3":9,"../func/truncate":11,"../utils/modify":14,"../utils/traverse":16}],13:[function(require,module,exports){
const config = require('../../config');
const { count_junk_line, is_junk_line } = require('../func/count_junk_line');
const { transform_js } = require('../func/transform_js');
const { patcher, patch_yaml } = require('../func/patch_yaml');
const Rjson = require('./Rjson');

class Ryaml {
  /**
   * @static Determine whenever it is a junk line.
   *
   * @param {string} line String to be determined.
   * @returns {boolean} Is junk line or not.
   */
  static isJunkLine({ line }) {
    return is_junk_line(line);
  }

  /**
   * Constructor.
   *
   * @param {string} raw YAML string.
   * @param {Object} env Immutable environment setup using config.js as default.
   */
  constructor(raw, env = config) {
    this._raw = raw;
    this._config = JSON.parse(JSON.stringify(env));
  }

  /**
   * Count number of junk lines (e.g. empty line) in YAML string.
   *
   * @param {number} lineNo For getting junk line before given line number, unset to be counting all lines.
   * @returns {number} Number of junk lines.
   */
  countJunkLine({ lineNo } = {}) {
    return count_junk_line({ sourceYaml: this._raw, lineNo });
  }

  /**
   * Patch YAML string with given patcher function.
   *
   * @param {Function} patcher => patcher.xxx().yyy() For actual patching the original YAML string.
   * @returns {Object} Immutable Ryaml with new YAML string.
   */
  patch(p) {
    return new Ryaml(p(patcher(this._raw)).result());
  }

  /**
   * Convert to Rjson object.
   *
   * @param {string} profile To let patch_yaml know which profile should it use for patching YAML string.
   * @returns {Object} Immutable Rjson.
   */
  toRjson({ profile = 'default' } = {}) {
    return new Rjson(transform_js({ yamlString: patch_yaml({ ...this._config })[profile]({ yamlString: this._raw }) }));
  }
  
  /**
   * Getter for raw.
   *
   * @returns {string} this._raw.
   */
  get raw() { return this._raw }
}

module.exports = Ryaml;

},{"../../config":1,"../func/count_junk_line":3,"../func/patch_yaml":8,"../func/transform_js":10,"./Rjson":12}],14:[function(require,module,exports){
class Modify {
  /**
   * Constructor
   *
   * @param  {Object} sourceObj Source object to be modified
   */
  constructor(sourceObj) {
    this._source = sourceObj;
  }

  /**
   * Append object `o` at the end of all keys with its children keypairs
   *
   * @param  {Object} o Object to be appended
   * @return {Object} Mutable self reference
   */
  append(o) {
    if (Array.isArray(this._source)) {
      const keys = Object.keys(this._source)
      if (keys.length > 0 && keys[keys.length - 1] < this._source.length - 1)
        this._source[parseInt(keys[keys.length - 1]) + 1] = o;
      else
        this._source.push(o);
    } else {
      Object.keys(o).forEach(key => {
        this._source[key] = o[key];
      });
    }
    return this;
  }

  /**
   * Prepend object `o` at the beginning of all keys with its children keypairs
   *
   * @param  {Object} o Object to be prepended
   * @return {Object} Mutable self reference
   */
  prepend(o) {
    if (Array.isArray(this._source)) {
      const keys = Object.keys(this._source)
      if (keys[0] && keys[0] > 0)
        this._source[keys[0] - 1] = o;
      else
        this._source.unshift(o);
    } else {
      const temp = new Modify({});
      Object.keys(this._source).forEach(name => {
        if (this._source[name] !== o) {
          temp.append({ [name]: this._source[name] });
          delete this._source[name];
        }
      });
      this.append(o);
      this.append(temp.self);
    }
    return this;
  }

  /**
   * Getter of this._source
   *
   * @return {Object} Underlying source object
   */
  get self() { return this._source; }
}

module.exports = o => o ? new Modify(o) : Modify;

},{}],15:[function(require,module,exports){
function functions () {
  //eslint-disable no-unused-vars

  this.getNumberOfNewLineChar = ln => {
    if (typeof ln === 'string') {
      const r = ln.match(/\n/g);
      return r ? r.length : 0;
    }
    return 0;
  }

  //eslint-enable no-unused-vars
  return this;
}

module.exports = functions();

},{}],16:[function(require,module,exports){
const fn = require('./fn');

class Traverse {
  /**
   * @static Getter of enumeration for traversing directions
   *
   * @return {Object} Enumeration for traversing directions
   */
  static get from() { return { LEFT_TO_RIGHT: 0, RIGHT_TO_LEFT: 1 } }

  /**
   * @static Getter of enumeration for targets
   *
   * @return {Object} Enumeration for targets
   */
  static get to() { return { FIRST: 0, MIDDLE: 1, LAST: 2 } }

  /**
   * Constructor
   *
   * @param  {Object} sourceObj Object to be traversed
   */
  constructor(sourceObj) {
    this._source = sourceObj;
    this._run = () => {};
  }

  /**
   * Run then() on each inodes breadth-wise and run whenNextLevel() for each level advancement
   *
   * @param  {enum} dir = Traverse.from.LEFT_TO_RIGHT direction for breadth-wise traverse
   * @return {Object} TraverseEachInodes object with extra whenNextLevel()
   */
  eachInodes(dir = Traverse.from.LEFT_TO_RIGHT) {  // breadth-wise
    this._run = (callback, nextLevelHandler) => {
      const queue = [];
      const _tr = sourceObj => {
        if (sourceObj) {
          const keys = Object.keys(sourceObj);
          if (dir === Traverse.from.RIGHT_TO_LEFT)
            keys.reverse();
          keys.forEach((name) => {
            callback(sourceObj, name, this);
            if (typeof sourceObj[name] === 'object')
              queue.push({ name, o: sourceObj });
          });
          nextLevelHandler(sourceObj, this);  // end of this level as keys.forEach done
        }
      }
      if (typeof this._source === 'object')
        _tr(this._source);
      while (queue.length > 0) {
        const { name: name2, o: o2 } = queue.shift();
        _tr(o2[name2]);
      }
    };
    return new TraverseEachInodes(this);
  }

  /**
   * Run then() on each inodes containing `obj`, starting from root depth-wise
   *
   * @param  {Object} obj Each traverse must contain obj as children
   * @return {Object} Mutable self reference
   */
  eachInodesWithObject(obj) {
    this._run = callback => {
      const _stk = [];
      const _tr = (sourceObj) => {
        if (sourceObj) {
          const keys = Object.keys(sourceObj);
          return keys.reduce((isObjChild, name) => {
            if (typeof sourceObj[name] === 'object') {
              const r = _tr(sourceObj[name]);
              if (r) _stk.push(name);
              return r || isObjChild;
            } else {
              return obj === sourceObj || isObjChild;
            }
          }, false);
        }
      };
      _tr(this._source);
      const _walk = (sourceObj) => {
        if (_stk.length > 0) {
          callback(sourceObj, _stk[_stk.length - 1], this);
          _walk(sourceObj[_stk.pop()]);
        }
      };
      _walk(this._source);
    };
    return this;
  }

  /**
   * Run then() on the deepest terminal
   *
   * @param  {enum} target = Traverse.to.FIRST if deepest terminal has siblings, determine which to run then()
   * @return {Object} Mutable self reference
   */
  toDeepestTerminal(target = Traverse.to.FIRST) {
    this._run = callback => {
      const { o } = this.eachInodes(Traverse.from.RIGHT_TO_LEFT).return;
      if (o) {
        const names = Object.keys(o);
        switch(target) {
          case Traverse.to.FIRST:
            callback(o, names[0], this); break;
          case Traverse.to.MIDDLE:
            callback(o, names[Math.floor(names.length / 2)], this); break;
          case Traverse.to.LAST:
            callback(o, names[names.length - 1], this); break;
        }
      }
    };
    return this;
  }

  /**
   * Run then() on specific line number, with reference to the YAML form of this._source
   *
   * @param  {number} lineNo Presented as numeric index of this._source as depth-wise, root as 0
   * @return {Object} Mutable self reference
   */
  toLineNo(lineNo) {
    this._run = callback => {
      const _tr = ({ sourceObj, lineNo, index }) => {
        if (sourceObj) {
          const keys = Object.keys(sourceObj);
          let i = 0;
          for (; i < keys.length; i++) {
            const name = keys[i];
            if (!Array.isArray(sourceObj) || typeof sourceObj[name] !== 'object') {
              const newLineNo = fn.getNumberOfNewLineChar(sourceObj[name]);
              if (newLineNo === 0 && index === lineNo)
                callback(sourceObj, name, this);
              else if (newLineNo > 0) {
                if (lineNo >= index && lineNo <= index + newLineNo)
                  callback(sourceObj, name, this);
                index += newLineNo;
              }
              index++;
            }
            if (typeof sourceObj[name] === 'object') index = _tr({ sourceObj: sourceObj[name], lineNo, index });
          }
        }
        return index;
      }
      _tr({ sourceObj: this._source, lineNo, index: 0 });
    };
    return this;
  }

  /**
   * Run then() on specific object `obj`
   *
   * @param  {Object} obj Specific object to traverse
   * @return {Object} Mutable self reference
   */
  toObject(obj) {
    this._run = callback => {
      const _tr = ({ sourceObj, obj }) => {
        if (sourceObj)
          Object.keys(sourceObj).map(name => {
            if (obj === sourceObj[name]) callback(sourceObj, name, this);
            else if (typeof sourceObj[name] === 'object') _tr({ sourceObj: sourceObj[name], obj });
          });
      }
      _tr({ sourceObj: this._source, obj });
    };
    return this;
  }

  /**
   * Promise.js like then() function, runner on every targeted traverse
   *
   * @param  {Function} f callback
   * @return {Object} Mutable self reference
   */
  then(f) { this._run(f); return this; }

  /**
   * @typedef {Object} Return
   * @property {Object} o Parent
   * @property {string} name Key
   */
  /**
   * Flattening then() to return LAST result (i.e. parameters passed to `f`) without callback
   *
   * @return {Return} Last result of all callback to be executed in each traverse
   */
  get return() {
    let o = null, name = null;
    this._run((_o, _name) => { o = _o; name = _name; });
    return { o, name };
  }

  /**
   * Getter of this._source
   *
   * @return {Object} Raw underlying object
   */
  get self() { return this._source; }
}

class TraverseEachInodes extends Traverse {
  /**
   * Constructor
   *
   * @param  {Traverse} traverser Traverse adapter fo providing whenNextLevel in then() and return()
   */
  constructor(traverser) {
    super(traverser._source);
    super._run = traverser._run;
    this._nextLevel = () => {};
  }

  /**
   * Runner for `eachInodes()` breadth-wise level advancement
   *
   * @param  {Function} f callback
   * @return {Object} Mutable self reference
   */
  whenNextLevel(f) {
    this._nextLevel = f;
    return this;
  }

  /**
   * Extending then() for adding this._nextLevel during call
   *
   * @param  {Function} f callback
   * @return {Object} Mutable self reference
   */
  then(f) { this._run(f, this._nextLevel); return this; }

  /**
   * Extending return() for adding this._nextLevel during call
   *
   * @return {Return} Last result of all callback to be executed in each traverse
   */
  get return() {
    let o = null, name = null;
    this._run((_o, _name) => { o = _o; name = _name; }, this._nextLevel);
    return { o, name };
  }
}

module.exports = o => o ? new Traverse(o) : Traverse;

},{"./fn":15}]},{},[2])(2)
});
