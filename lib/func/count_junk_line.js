const isArraySeparator = ln => ln.match(/^-{3,}/) !== null;

const isComment = ln => ln.match(/^\s*#+/) !== null;

const isWhiteline = ln => ln.match(/^\s*$/) !== null;

const isJunk = ln => isWhiteline(ln) | isComment(ln) | isArraySeparator(ln);

const isParserIgnorable = ln => isWhiteline(ln) | isComment(ln);

const count = ({ sourceYaml, lineNo }) => {
  const arr = sourceYaml.split('\n');
  return arr.reduce((acc, curr, i) => acc += (isJunk(curr) && (lineNo == null || i <= lineNo)) ? 1 : 0, 0);
}

module.exports = {
  count_junk_line: count,
  is_junk_line: isJunk,
  is_parser_ignorable: isParserIgnorable
};
