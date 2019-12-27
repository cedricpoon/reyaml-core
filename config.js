const getTruncatedD3 = (attribute, fillColor) => ({
  attributes: { '': attribute },
  nodeSvgShape: {
    shape: 'rect',
    shapeProps: {
      width: 15,
      height: 15,
      x: -10,
      y: -5,
      stroke: 'grey',
      fill: fillColor,
    }
  },
});

const lbs = '|+';
const config = {
  section: '§',
  sectionLeft: '(§',
  sectionRight: '§)',
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
      d3: getTruncatedD3('🡇', 'yellow'),
    },
    truncatedUp: {
      name: 'truncatedUp',
      d3: getTruncatedD3('🡅', 'yellow'),
    },
    truncatedLeft: {
      name: 'truncatedLeft',
      d3: getTruncatedD3('🡄', 'yellowgreen'),
    },
    truncatedRight: {
      name: 'truncatedRight',
      d3: getTruncatedD3('🡆', 'yellowgreen'),
    },
  }
};

module.exports = config;
