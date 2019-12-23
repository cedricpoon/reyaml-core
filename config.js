const getTruncatedD3 = attribute => ({
  attributes: { '': attribute },
  nodeSvgShape: {
    shape: 'rect',
    shapeProps: {
      width: 15,
      height: 15,
      x: -10,
      y: -5,
      stroke: 'grey',
      fill: 'yellow',
    }
  },
});

const lbs = '|+';
const config = {
  section: '§',
  keyPostfix: '⏎',
  tabSize: 2,
  literalBlockScalar: lbs,
  literalBlockChoppingScalar: '|-',
  blockScalar4Traverse: {
    '\\|\\-': lbs,
    '>\\-': lbs,
    '>\\+': lbs
  },
  maxStringLength: 15,
  marker: { name: '*', content: '**' },
  markerMap: {
    highlight: {
      name: 'highlight',
      d3: {
        nodeSvgShape: {
          shape: 'circle',
          shapeProps: {
            r: 10,
            fill: 'red',
            stroke: 'red',
          },
        },
      }
    },
    truncatedDown: {
      name: 'truncatedDown',
      d3: getTruncatedD3('⬇'),
    },
    truncatedUp: {
      name: 'truncatedUp',
      d3: getTruncatedD3('⬆'),
    },
    truncatedLeft: {
      name: 'truncatedLeft',
      d3: getTruncatedD3('⬅'),
    },
    truncatedRight: {
      name: 'truncatedRight',
      d3: getTruncatedD3('⮕'),
    },
  }
};

module.exports = config;
