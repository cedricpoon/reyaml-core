const { is_junk_line } = require('./func/count_junk_line');
const Ryaml = require('./object/Ryaml');
const Rjson = require('./object/Rjson');

module.exports = {
  Ryaml,
  Rjson,
  isJunkLine: is_junk_line
};
