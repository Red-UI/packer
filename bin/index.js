#!/usr/bin/env node

'use strict';
const commander = require('commander')
const chalk = require('chalk')
const path = require('path')
const debug = require('debug')('bin/index')
const pkg = require('../package.json')
const program = commander
  .version(pkg.version)
  .command('init', 'Generate a new RED-UI project.')
  .command('dev', 'Start development server.')
  .command('build', 'Build for distribution.')
  .parse(process.argv)
