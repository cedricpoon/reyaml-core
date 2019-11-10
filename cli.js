const fs = require('fs');
const jsYaml = require('js-yaml');
const reyamlCore = require('./core');

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

async function writeResult({ jsUpdatedSource }) {
  const newFileName = `${process.argv[2].split('.').slice(0, -1).join('.')}-updated.json`;
  // Output
  try {
    await writeFile({ path: newFileName, result: JSON.stringify(jsUpdatedSource, null, 2) });
    console.log(`"${newFileName}" is created with your updates.`);
  } catch (e) {
    console.log(`Updates cannot be applied with error:\n${e}`);
  }
}

function error() {
  console.log(
    '\nUsage: npm start << source-file.yaml >> [ actions ] { ... action args ... }\n' +
    '       ... [ insert ]          << key-in-source-file >>  << to-be-inserted.yaml >>\n' +
    '       ... [ transform-d3 ]\n' +
    '       ... [ transform-js ]\n' +
    '       ... [ count-key ]\n' +
    '       ... [ mark-line ]       << line-number >>\n' +
    '       ... [ count-junk-line ] << line-number >>\n'
  );
}

async function main() {
  if (process.argv.length >= 4) {
    const source = await readFile({ path: process.argv[2] });
    // YAML to JSON
    const jsSource = reyamlCore.transform_js({ yamlString: source });
    // Result
    let jsUpdatedSource;
    // Main options
    switch (process.argv[3]) {

      case 'count-junk-line':
        if (process.argv.length === 5) {
          const line_no = parseInt(process.argv[4], 10);
          console.log(reyamlCore.count_junk_line({ sourceYaml: source, lineNo: line_no }));
        } else {
          error();
        }
        break;

      case 'mark-line':
        if (process.argv.length === 5) {
          const line_no = parseInt(process.argv[4], 10);
          writeResult({ jsUpdatedSource: reyamlCore.mark_line({ sourceObj: jsSource, lineNo: line_no }) });
        } else {
          error();
        }
        break;

      case 'insert':
        if (process.argv.length === 6) {
          const _new = await readFile({ path: process.argv[5] });
          const jsNew = reyamlCore.transform_js({ yamlString: _new });
          writeResult({
            jsUpdatedSource: reyamlCore.insert({ key: process.argv[4] , jsSource, jsNew })
          });
        } else {
          error();
        }
        break;

      case 'transform-d3':
        if (process.argv.length === 4) {
          writeResult({
            jsUpdatedSource: reyamlCore.transform_d3({ sourceObj: jsSource })
          });
        } else {
          error();
        }
        break;

      case 'count-key':
        if (process.argv.length === 4) {
          console.log(reyamlCore.count_key({ sourceObj: jsSource }));
        } else {
          error();
        }
        break;

      case 'transform-js':
        if (process.argv.length === 4) {
          writeResult({
            jsUpdatedSource: jsSource
          });
        } else {
          error();
        }
        break;

      default:
        error();
    }
  } else {
    error();
  }
}

main();
