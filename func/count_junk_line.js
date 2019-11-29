const isArraySeparator = ln => ln.match(/^\-{3,}/g) !== null;

const isComment = ln => ln.match(/^\s*#+/g) !== null;

const isWhiteline = ln => ln.match(/^\s*$/g) !== null;

const isJunk = ln => isWhiteline(ln) | isComment(ln) | isArraySeparator(ln);

const count = ({ sourceYaml, lineNo }) => {
  const arr = sourceYaml.split('\n');
  return arr.reduce((acc, curr, i) => acc += (isJunk(curr) && i <= lineNo) ? 1 : 0, 0);
}

module.exports = {
  count_junk_line: count,
  is_junk_line: isJunk
};
