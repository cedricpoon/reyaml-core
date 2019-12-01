const { marker, markerMap, rootName, maxStringLength } = require('../config');

const limitString = (ln, n) => (ln.length > n) ? ln.substr(0, n-1) + '...' : ln;

function transform_mark({ sourceObj, key }) {
  if (sourceObj[key] && sourceObj[key].hasOwnProperty(marker.name)) {
    if (sourceObj[key].hasOwnProperty(marker.content))
      return { marked: true, type: sourceObj[key][marker.name], pureContent: sourceObj[key][marker.content] };
    else
      return { marked: true, type: sourceObj[key][marker.name], pureContent: null };
  } else {
    return { marked: false, type: null, pureContent: sourceObj[key] };
  }
}

function transform_d3_master({ sourceObj }) {
  if (Array.isArray(sourceObj))
    return transform_d3_from_array({ sourceObj, rootName });
  else if (sourceObj != null && Object.keys(sourceObj).length > 1)
    return transform_d3_from_multi_key_object({ sourceObj });
  else
    return transform_d3_from_object({ sourceObj });
}

function transform_d3_from_multi_key_object({ sourceObj }) {
  const o = {};
  o[rootName] = sourceObj;
  return transform_d3_from_object({ sourceObj: o });
}

function transform_d3_from_array({ sourceObj, rootName }) {
  const a = [];
  sourceObj.filter(o => o != null).forEach((obj, i) => {
    const o = {};
    const r = transform_d3_from_object({ sourceObj: obj });
    o.name = `[${i}]`;
    o.children = r;
    a.push(o);
  });
  return [{ name: rootName, children: a }];
}

function transform_d3_from_object({ sourceObj }) {
  const a = [];
  if (sourceObj != null) {
    if (!Array.isArray(sourceObj)) {
      Object
        .entries(sourceObj)
        .forEach(([key, value]) => {
          const { marked, type, pureContent } = transform_mark({ sourceObj, key });
          if (typeof pureContent === 'object') {
            const o = marked ? { ...markerMap[type].d3 } : {} ;
            const na = transform_d3_from_object({ sourceObj: pureContent });
            o.name = limitString(key, maxStringLength);
            o.children = na;
            a.push(o);
          } else {
            const o = marked ? { ...markerMap[type].d3 } : {} ;
            o.name = limitString(key, maxStringLength);
            o.attributes = {};
            o.attributes[""] = limitString(pureContent, maxStringLength);
            a.push(o);
          }
        });
    } else {
      sourceObj.forEach((o, key) => {
        if (typeof o === 'object' && o && !o.hasOwnProperty(marker.name)) {
          const r = transform_d3_from_object({ sourceObj: o });
          a.push.apply(a, r);
        } else {
          const { marked, type, pureContent } = transform_mark({ sourceObj, key });
          const x = marked ? { ...markerMap[type].d3 } : {};
          x.name = pureContent;
          x.attributes = {};
          a.push(x);
        }
      });
    }
  }
  return a;
}

module.exports = { transform_d3: transform_d3_master };
