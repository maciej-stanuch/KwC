#!/usr/bin/env node

const https = require('https');
const path = require('path');
const program = require('commander');
const chalk = require('chalk');

const config = require('../config.json');
const pkg = require(path.join(__dirname, '../package.json'));

const aboutCommand = require('./commands/about.js');


program
.version(pkg.version)
.description(pkg.description);

program
.command('about')
.alias('a')
.description('Displays information about KwC project.')
.action(() => aboutCommand());

program.parse(process.argv);