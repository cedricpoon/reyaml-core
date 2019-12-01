const fs = require('fs');

function readFile({ path }) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) { reject(err); }
      resolve(data);
    });
  });
}

function writeFile({ path, result }) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, result, (err) => {
      if (err) { reject(err); }
      resolve();
    });
  });
}

module.exports = { readFile, writeFile };
