#!/usr/bin/env node

'use strict';
const commander = require('commander')
const chalk = require('chalk')
const path = require('path')
const debug = require('debug')('bin/index')

const program = commander
  .version('0.0.1')
  .command('init', 'Generate a new RED-UI project.')
  .command('dev', 'Start development server.')
  .command('build', 'Build for distribution.')
  .parse(process.argv)
