#!/usr/bin/env node
/* eslint-env node */

const { Ryaml } = require('..');
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
  console.log(`
Usage: rc [-h|--help] [-v|--version] [[-f|--file file] action [..args]]

Positional arguments:
  file                      Source YAML file to be processed
  action                    Name of action to be performed
  args                      Action arguments depending on chosen action

Optional arguments:
  -h, --help                Show this user manual and exit
  -v, --version             Display version number and exit
  -f, --file                Source YAML as file

Actions:
  insert [..args]           Insert YAML [file] under each [key] in source YAML
  transform-d3              Transform source YAML into D3 Hierarchical JSON
  transform-js              Transform source YAML into JSON using 'js-yaml' module
  count-key                 Count number of keys in source YAML
  mark-line [..args]        Mark [lineNo] in source YAML using markerMap in 'config.js'
  count-junk-line [..args]  Count number of junk line in source YAML before [lineNo]
  truncate [..args]         Truncate vertically by [level] and horizontally by [size] in YAML pivoted on [lineNo]
  patch-yaml [..args]       Not yet implemented
  `);
}

async function main() {
  if (process.argv.length >= 4) {
    const source = await readFile({ path: process.argv[2] });
    // create Ryaml Object
    const ryaml = new Ryaml(source);
    // Main options
    switch (process.argv[3]) {

      case 'truncate':
        if (process.argv.length === 6) {
          const line_no = parseInt(process.argv[4], 10);
          const level = parseInt(process.argv[5], 10);
          writeResult({ jsUpdatedSource: ryaml.toRjson().truncate({ lineNo: line_no, level }).raw });
        } else {
          error();
        }
        break;

      case 'count-junk-line':
        if (process.argv.length === 5) {
          const line_no = parseInt(process.argv[4], 10);
          console.log(ryaml.countJunkLine({ lineNo: line_no }));
        } else {
          error();
        }
        break;

      case 'mark-line':
        if (process.argv.length === 5) {
          const line_no = parseInt(process.argv[4], 10);
          writeResult({ jsUpdatedSource: ryaml.toRjson().markLine({ lineNo: line_no }).raw });
        } else {
          error();
        }
        break;

      case 'insert':
        if (process.argv.length === 6) {
          const _new = await readFile({ path: process.argv[5] });
          const insertee = new Ryaml(_new).toRjson();
          writeResult({ jsUpdatedSource: ryaml.toRjson().insert({ key: process.argv[4], insertee }).raw });
        } else {
          error();
        }
        break;

      case 'transform-d3':
        if (process.argv.length === 4) {
          writeResult({ jsUpdatedSource: ryaml.toRjson().toD3() });
        } else {
          error();
        }
        break;

      case 'count-key':
        if (process.argv.length === 4) {
          console.log(ryaml.toRjson().keyCount);
        } else {
          error();
        }
        break;

      case 'transform-js':
        if (process.argv.length === 4) {
          writeResult({ jsUpdatedSource: ryaml.toRjson().raw });
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
