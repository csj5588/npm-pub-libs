#!/usr/bin/env node

const program = require('commander');
const transform = require('./../src/transform');
const cdn = require('./../src/compile/cdnLoad');
const gulp = require('./../src/gulpfile');
const init = require('./../src/materials');

program
  .command('compile <schema>')
  .option('-f, --file <String>', 'Enter schema file path')
  .action(function(schema, cmd){
    const _file = cmd.file;
    transform.run(schema, _file).then(function() {
      cdn.run(_file).then(function() {
        setTimeout(() => {
          gulp.run(_file);
        }, 1000)
      });
    });
  });
program
  .command('materials <fileName>')
  .option('-f, --file <String>', 'Enter schema file path')
  .action(function(schema, cmd){
    init.run(schema);
  });
program.parse(process.argv);