const patchD3 = ({ attributes, color }) => ({
  attributes: { ...attributes },
  nodeSvgShape: {
    shapeProps: {
      ...color
    },
  },
});

const blockScalar = {
  literalKeep: '|+',
  literalStrip: '|-',
  foldedKeep: '>+',
  foldedStrip: '>-'
};

const config = {
  symbol: { /* default symbol used by profile `d3Tree` */
    section: '§',
    sectionLeft: '◦§',
    sectionRight: '§◦',
    keyPostfix: '⏎',
  },
  size: { /* numeric variables */
    tabSize: 2,
    maxStringSize: 15, /* maximum length of key and content in JSON keypair */
  },
  wrapKeyPairScalar: blockScalar.literalStrip, /* scalar for wrapKeyPair() in profile `d3Tree` */
  appendBlockScalar: blockScalar.literalKeep, /* scalar for appendBlockScalar() in profile `d3Tree` */
  blockScalarTranslation: { /* scalar map for unifyBlockScalar() in profile `d3Tree` */
    [blockScalar.literalStrip]: blockScalar.literalKeep,
    [blockScalar.foldedStrip]: blockScalar.literalKeep,
    [blockScalar.foldedKeep]: blockScalar.literalKeep
  },
  nodeMap: { /* default D3 hierarchical tree node */
    object: {
      d3: { attributes: {}, nodeSvgShape: { shape: 'circle', shapeProps: { r: 10 } } }
    },
    array: {
      d3: { attributes: {}, nodeSvgShape: { shape: 'rect', shapeProps: { width: 15, height: 15, x: -10, y: -5 } } }
    }
  },
  marker: { name: '*', content: '**' }, /* intermediate marking structure for JSON */
  markerMap: {  /* types of marking to be applied in D3 transformation */
    highlight: {  /* active line indicator */
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
