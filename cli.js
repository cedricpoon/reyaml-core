/* eslint-env node */
const rc = require('./index');
const { readFile, writeFile } = require('./utils/file_io');

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
    '       ... [ count-junk-line ] << line-number >>\n' +
    '       ... [ truncate ]        << line-number >>  << level >> \n'
  );
}

async function main() {
  if (process.argv.length >= 4) {
    const source = await readFile({ path: process.argv[2] });
    // create Ryaml Object
    const ryaml = new rc.Ryaml(source);
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
          const insertee = new rc.Ryaml(_new).toRjson();
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
