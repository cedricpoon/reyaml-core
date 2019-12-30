const { marker, markerMap, nodeMap, section, maxStringLength, keyPostfix } = require('../config');

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

function transform_d3_master({ sourceObj, nameHandler }) {
  if (sourceObj != null && Object.keys(sourceObj).length > 1)
    return transform_d3_from_object({ sourceObj: { [section]: sourceObj }, nameHandler });
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
          o.attributes[""] = limitString(pureContent, maxStringLength);
        }
      });
  }
  return a;
}

const transform_d3_profile = {
  default: ({ sourceObj }) => transform_d3_master({
    sourceObj,
    nameHandler: x => limitString(x, maxStringLength)
  }),
  preD3: ({ sourceObj }) => transform_d3_master({
    sourceObj,
    nameHandler: x => limitString(x.slice(-1) === keyPostfix ? `${x.slice(0, -1)} ` : x, maxStringLength)
  })
};

module.exports = { transform_d3: transform_d3_profile };
