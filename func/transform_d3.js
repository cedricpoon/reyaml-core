const { marker, markerMap, nodeMap, section, maxStringLength } = require('../config');

const limitString = (ln, n) => (ln.length > n) ? ln.substr(0, n-1) + '...' : ln;

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

function transform_d3_master({ sourceObj }) {
  if (sourceObj != null && Object.keys(sourceObj).length > 1)
    return transform_d3_from_multi_key_object({ sourceObj });
  else
    return transform_d3_from_object({ sourceObj });
}

function transform_d3_from_multi_key_object({ sourceObj }) {
  const o = {};
  o[section] = sourceObj;
  return transform_d3_from_object({ sourceObj: o });
}

function transform_d3_from_object({ sourceObj }) {
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
        o.name = limitString(Array.isArray(sourceObj) ? `[${key}]` : key, maxStringLength);
        a.push(o);
        if (typeof pureContent === 'object') {
          const na = transform_d3_from_object({ sourceObj: pureContent });
          o.children = na;
        } else {
          o.attributes = {};
          o.attributes[""] = limitString(pureContent, maxStringLength);
        }
      });
  }
  return a;
}

module.exports = { transform_d3: transform_d3_master };
