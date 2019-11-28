const rootName = 'root';

const marker = { name: '*', content: '**' }

const literalBlockScalar = '|+';

const literalBlockChoppingScalar = '|-';

const blockScalar4Traverse = { '\\|\\-': literalBlockScalar, '>\\-': literalBlockScalar, '>\\+': literalBlockScalar };

const markerMap = {
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

module.exports = { rootName, marker, markerMap, blockScalar4Traverse, literalBlockScalar, literalBlockChoppingScalar };
