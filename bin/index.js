#!/usr/bin/env node

'use strict';
const yargs = require('yargs')
const argv = yargs
  .usage('Usage: $0 <command> [options]')
  .command('init', 'Init the program', () => {
    require('./init')
    process.exit(0)
  })

  .command('dev', 'Start a dev server with builder', () => {
    require('./dev')
    process.exit(0)
  })

  .command('build', 'Build the program', () => {
    require('./build')
    process.exit(0)
  })

  .default({ h: true })
  .help('h')
  .alias('h', 'help')
  .epilog('Copyright Redrock-Team 2016')
  .argv

const cwd = process.cwd()

const options = {
  cwd: cwd
}

