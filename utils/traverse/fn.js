function functions () {
  //eslint-disable no-unused-vars

  this.getNumberOfNewLineChar = ln => {
    if (typeof ln === 'string') {
      const r = ln.match(/\n/g);
      return r ? r.length : 0;
    }
    return 0;
  }

  //eslint-enable no-unused-vars
  return this;
}

module.exports = functions();
