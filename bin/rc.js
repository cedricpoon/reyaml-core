#!/usr/bin/env node
// eslint-env node

const fs = require('fs');
const { ArgumentParser } = require('argparse');
const process = require('process');

const package_json = require('../package.json');
const { Ryaml, Rjson } = require('..');

// -- top level command --
const rc = new ArgumentParser({
  prog: package_json.name.split('-').reduce((s, x) => s + x[0], ''),
  version: package_json.version,
  addHelp: true
});

rc.addArgument([ '-Y', '--yaml' ], {
  help: 'Source YAML as utf-8 file.',
  action: 'store',
  dest: '_yamlPath',
  metavar: 'YAML'
});

rc.addArgument([ '-J', '--json' ], {
  help: 'Source JSON as utf-8 file.',
  action: 'store',
  dest: '_jsonPath',
  metavar: 'JSON'
});

const subrc = rc.addSubparsers({
  title: 'Commands',
  metavar: '[ACTION]',
  required: true,
  dest: '_action',
  help: 'List of available Actions.'
});

// -- insert command --
const insert = subrc.addParser('insert', {
  description: 'Insert YAML insertee under each key in Source.',
  get 'help'() { return this.description }
});

insert.addArgument('key', {
  help: 'Key in Source for inserting insertee YAML.',
  action: 'store',
});

insert.addArgument('insertee', {
  help: 'Insertee YAML file.',
  action: 'store'
});

// -- transform-d3 command --
subrc.addParser('transform-d3', {
  description: 'Transform Source into D3 Hierarchical JSON.',
  get 'help' () { return this.description },
});

// -- transform-js command --
subrc.addParser('transform-js', {
  description: 'Transform Source into JSON using "js-yaml" module.',
  get 'help' () { return this.description },
});

// -- count-key command --
subrc.addParser('count-key', {
  description: 'Count number of keys in Source.',
  get 'help' () { return this.description },
});

// -- mark-line command --
const markLine = subrc.addParser('mark-line', {
  description: 'Mark lineNo in Source using markerMap in "config.js".',
  get 'help' () { return this.description },
});

markLine.addArgument('lineNo', {
  help: 'Line number for marking.',
  type: 'int',
  action: 'store'
});

// -- count-junk-line command --
const countJunkLine = subrc.addParser('count-junk-line', {
  description: 'Count number of junk line in source YAML before lineNo.',
  get 'help' () { return this.description },
});

countJunkLine.addArgument('lineNo', {
  help: 'Line number for counting junk line before.',
  type: 'int',
  action: 'store'
});

// -- truncate command --
const truncate = subrc.addParser('truncate', {
  description: 'Truncate vertically by level and horizontally by size in YAML pivoted on lineNo.',
  get 'help' () { return this.description },
});

truncate.addArgument('lineNo', {
  help: 'Line number to pivot the truncation.',
  type: 'int',
  action: 'store'
});

truncate.addArgument([ '-l', '--level' ], {
  help: 'Retain for N level upward-downwards.',
  type: 'int',
  action: 'store'
});

truncate.addArgument([ '-s', '--siblingSize' ], {
  help: 'Retain for N siblings.',
  type: 'int',
  action: 'store'
});

truncate.addArgument([ '-m', '--trimMark' ], {
  help: 'Include marking of regarding trim.',
  action: 'storeTrue'
});

// -- patch-yaml command --
subrc.addParser('patch-yaml', {
  description: 'Patch source YAML with the given patcher.',
  get 'help' () { return this.description },
});

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

function fromPipeline() {
  return new Promise((resolve) => {
    process.stdin.on('data', payload => {
      return resolve(payload.toString('utf8'));
    })
  });
}

async function main() {
  const args = rc.parseArgs();
  console.log(args);
  // construct source object
  let source;
  if (args._yamlPath) {
    source = new Ryaml(await readFile({ path: args._yamlPath }));
  } else if (args._jsonPath) {
    source = new Rjson(await readFile({ path: args._jsonPath }));
  } else {
    const pipe = await fromPipeline();
    try {
      source = new Rjson(JSON.parse(pipe));
    } catch (e) {
      source = new Ryaml(pipe);
    }
  }
}

main();