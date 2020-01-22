#!/usr/bin/env node
/* eslint-env node */

const fs = require('fs');
const { ArgumentParser } = require('argparse');
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
  action: 'store'
});

rc.addArgument([ '-J', '--json' ], {
  help: 'Source JSON as utf-8 file.',
  action: 'store'
});

const subrc = rc.addSubparsers({
  title: 'Commands',
  metavar: '[ACTION]',
  required: true,
  dest: 'action',
  help: 'List of available Actions.'
});

// -- insert command --
const insert = subrc.addParser('insert', {
  description: 'Insert YAML insertee under each key in Source.',
  get 'help'() { return this.description }
});

insert.addArgument('key', {
  help: 'Key in Source for inserting insertee YAML.',
  action: 'store'
});

insert.addArgument('insertee', {
  help: 'Insertee YAML file.',
  action: 'store'
});

// -- transform-d3 command --
const transformD3 = subrc.addParser('transform-d3', {
  description: 'Transform Source into D3 Hierarchical JSON.',
  get 'help' () { return this.description },
});

// -- transform-js command --
const transformJS = subrc.addParser('transform-js', {
  description: 'Transform Source into JSON using "js-yaml" module.',
  get 'help' () { return this.description },
});

// -- count-key command --
const countKey = subrc.addParser('count-key', {
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
  action: 'store'
});

// -- count-junk-line command --
const countJunkLine = subrc.addParser('count-junk-line', {
  description: 'Count number of junk line in source YAML before lineNo.',
  get 'help' () { return this.description },
});

countJunkLine.addArgument('lineNo', {
  help: 'Line number for counting junk line before.',
  action: 'store'
});

// -- truncate command --
const truncate = subrc.addParser('truncate', {
  description: 'Truncate vertically by level and horizontally by size in YAML pivoted on lineNo.',
  get 'help' () { return this.description },
});

truncate.addArgument('lineNo', {
  help: 'Line number to pivot the truncation.',
  action: 'store'
});

truncate.addArgument([ '-l', '--level' ], {
  help: 'Retain for N level upward-downwards.',
  action: 'store'
});

truncate.addArgument([ '-s', '--siblings' ], {
  help: 'Retain for N siblings.',
  action: 'store'
});

truncate.addArgument([ '-m', '--mark' ], {
  help: 'Include marking of regarding trim.',
  action: 'storeTrue'
});

// -- patch-yaml command --
const patchYaml = subrc.addParser('patch-yaml', {
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

function main() {
  rc.parseArgs();
}

main();