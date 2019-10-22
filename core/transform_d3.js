function transform_d3_master({ sourceObj }) {
  if (Array.isArray(sourceObj))
    return transform_d3_from_array({ sourceObj, rootName: 'root' });
  else
    return transform_d3_from_object({ sourceObj });
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
          if (typeof value === 'object') {
            const na = transform_d3_from_object({ sourceObj: value });
            const o = {};
            o.name = `${key}:`;
            o.children = na;
            a.push(o);
          } else {
            const o = {};
            o.name = '';
            o.attributes = {};
            o.attributes[key] = value;
            a.push(o);
          }
        });
    } else {
      sourceObj.forEach(o => {
        const r = transform_d3_from_object({ sourceObj: o });
        a.push.apply(a, r);
      });
    }
  }
  return a;
}

module.exports = { transform_d3: transform_d3_master };
