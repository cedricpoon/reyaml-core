const literalBlockScalar = '|+';

const config = {
  rootName: 'root',
  literalBlockScalar: literalBlockScalar,
  literalBlockChoppingScalar: '|-',
  blockScalar4Traverse: { '\\|\\-': literalBlockScalar, '>\\-': literalBlockScalar, '>\\+': literalBlockScalar },
  maxStringLength: 17,
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
    truncated: {
      name: 'truncated',
      d3: {
        attributes: { '': '.....' },
        nodeSvgShape: {
          shape: 'rect',
          shapeProps: {
            width: 20,
            height: 20,
            x: -10,
            y: -10,
            stroke: 'lightgrey',
            fill: 'lightgrey',
          }
        },
      }
    }
  }
};

module.exports = config;
