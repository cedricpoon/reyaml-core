const rootName = 'root';
const marking = {
  marker: '*',
  content: '**',
  d3: {
    nodeSvgShape: {
      shape: 'circle',
      shapeProps: {
        r: 10,
        fill: 'red',
      },
    },
  }
};

function transform_mark({ sourceObj, key }) {
  if (sourceObj[key] && sourceObj[key].hasOwnProperty(marking.marker) && sourceObj[key].hasOwnProperty(marking.content)) {
    return { marked: true, pureContent: sourceObj[key][marking.content] };
  } else {
    return { marked: false, pureContent: sourceObj[key] };
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
          const { marked, pureContent } = transform_mark({ sourceObj, key });
          if (typeof pureContent === 'object') {
            const o = marked ? { ...marking.d3 } : {} ;
            const na = transform_d3_from_object({ sourceObj: pureContent });
            o.name = key;
            o.children = na;
            a.push(o);
          } else {
            const o = marked ? { ...marking.d3 } : {} ;
            o.name = key;
            o.attributes = {};
            o.attributes[""] = pureContent;
            a.push(o);
          }
        });
    } else {
      sourceObj.forEach((o, key) => {
        if (typeof o === 'object' && o && !marking.marker in o) {
          const r = transform_d3_from_object({ sourceObj: o });
          a.push.apply(a, r);
        } else {
          const { marked, pureContent } = transform_mark({ sourceObj, key });
          const x = marked ? { ...marking.d3 } : {};
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
