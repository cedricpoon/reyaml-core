const patchD3 = ({ attributes, color }) => ({
  attributes: { ...attributes },
  nodeSvgShape: {
    shapeProps: {
      ...color
    },
  },
});

const config = {
  section: '§',
  sectionLeft: '◦§',
  sectionRight: '§◦',
  keyPostfix: '⏎',
  tabSize: 2,
  literalBlockScalar: '|+',
  literalBlockChoppingScalar: '|-',
  blockScalar4Traverse: {
    get '\\|\\-' () { return this.literalBlockScalar },
    get '>\\-' () { return this.literalBlockScalar },
    get '>\\+' () { return this.literalBlockScalar }
  },
  maxStringLength: 15,
  nodeMap: {
    object: {
      d3: { attributes: {}, nodeSvgShape: { shape: 'circle', shapeProps: { r: 10 } } }
    },
    array: {
      d3: { attributes: {}, nodeSvgShape: { shape: 'rect', shapeProps: { width: 15, height: 15, x: -10, y: -5 } } }
    }
  },
  marker: { name: '*', content: '**' },
  markerMap: {
    highlight: {
      name: 'highlight',
      d3: patchD3({ color: { fill: 'red', stroke: 'red' } }),
    },
    truncatedDown: {
      name: 'truncatedDown',
      d3: patchD3({ attributes: { '': '⬇' }, color: { fill: 'lightgoldenrodyellow', stroke: 'grey' } }),
    },
    truncatedUp: {
      name: 'truncatedUp',
      d3: patchD3({ attributes: { '': '⬆' }, color: { fill: 'lightgoldenrodyellow', stroke: 'grey' } }),
    },
    truncatedLeft: {
      name: 'truncatedLeft',
      d3: patchD3({ attributes: { '': '⬅' }, color: { fill: 'lightcyan', stroke: 'grey' } }),
    },
    truncatedRight: {
      name: 'truncatedRight',
      d3: patchD3({ attributes: { '': '⮕' }, color: { fill: 'lightcyan', stroke: 'grey' } }),
    },
  }
};

module.exports = config;
