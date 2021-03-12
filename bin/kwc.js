#!/usr/bin/env node

const path = require('path');
const program = require('commander');

const config = require('../config.json');
const pkg = require(path.join(__dirname, '../package.json'));

const aboutCommand = require('./commands/about.js');
const runCommand = require('./commands/run.js');


program
    .version(pkg.version)
    .description(pkg.description);

program
    .command('about')
    .alias('a')
    .description('Displays information about KwC project.')
    .action(() => aboutCommand());

program
    .command('run')
    .alias('r')
    .description('Runs program with default configuration.')
    .option('-f, --files <files>', 'Files with addresses to analyze.', 'default_db.csv')
    .action((options) => runCommand(options));

program.parse(process.argv);