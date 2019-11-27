const { is_junk_line } = require('./core/count_junk_line');
const Ryaml = require('./object/Ryaml');

module.exports = {
  Ryaml,
  isJunkLine: is_junk_line
};
