const literalBlockScalar = '|+';

const getTruncatedD3 = attribute => ({
  attributes: { '': attribute },
  nodeSvgShape: {
    shape: 'rect',
    shapeProps: {
      width: 15,
      height: 15,
      x: -10,
      y: -10,
      stroke: 'grey',
      fill: 'yellow',
    }
  },
});

const config = {
  rootName: '§',
  tabSize: 2,
  literalBlockScalar: literalBlockScalar,
  literalBlockChoppingScalar: '|-',
  blockScalar4Traverse: { '\\|\\-': literalBlockScalar, '>\\-': literalBlockScalar, '>\\+': literalBlockScalar },
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
      d3: getTruncatedD3('↓↓↓↓↓'),
    },
    truncatedUp: {
      name: 'truncatedUp',
      d3: getTruncatedD3('↑↑↑↑↑'),
    }
  }
};

module.exports = config;
