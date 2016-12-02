#!/usr/bin/env node

'use strict';
const yargs = require('yargs')
const chalk = require('chalk')
const path = require('path')
const debug = require('debug')('bin/index')
const cwd = process.cwd()

function dispatchSubCommand(subCommand) {
  const redfileOptions = {}
  try {
    const redfile = require(path.join(cwd, 'redfile.json'))
    Object.assign(redfileOptions, redfile)
  } catch(err) {
    console.log(`Can not find or open ${chalk.red('redfile.json')} here, please check.`)
    debug(err.stack)
    process.exit(1)
  }

  return (yargs) => {
    yargs.default({ h: false })
    try {
      require('./' + subCommand)(redfileOptions)
    } catch(err) {
      console.log('Execute failed in %s', subCommand)
      debug(err.stack)
      process.exit(1)
    }
  }
}

const argv = yargs
  .usage('Usage: $0 <command> [options]')
  .default({ h: true })
  .command('init', 'Init the program', dispatchSubCommand('init'))
  .command('dev', 'Start a dev server with builder', dispatchSubCommand('dev'))
  .command('build', 'Build the program', dispatchSubCommand('build'))

  .help('h')
  .alias('h', 'help')
  .epilog('Copyright Redrock-Team 2016')
  .argv

