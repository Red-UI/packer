#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const cwd = process.cwd()
const debug = require('debug')('bin/dev')

function detectEntry(cwd, type, isSpa) {
  try {
    if (type === 'project') {
      if (isSpa) { // SPA
        const srcFiles = fs.readdirSync(path.join(cwd, 'src')) || []
        const entry = srcFiles.filter((filename) => /^index.jsx?$/.test(filename))
          .map((filename) => path.join(cwd, 'src', filename))
        if (entry.length === 0) {
          throw new Error('Entry Not Found')
        }
        return entry
      } else {
        // Multi entry
        const pages = fs.readdirSync(path.join(cwd, 'src/pages'))
        return pages.reduce((entry, currentPage) => {
          entry[`pages/${currentPage}`] = path.join(cwd, 'src/pages/', currentPage, 'index')
          return entry
        }, {})
      }
    } else if (type == 'component') {
      const demos = fs.readdirSync(path.resolve(cwd, 'demo/'))
      return demos
        .filter((filename) => /\.jsx?$/.test(filename))
        .reduce((result, filename) => {
          const chunk = filename.replace(/(\.jsx?)$/, '')
          result['demo/' + chunk] = path.resolve(cwd, 'demo/' + filename)
          return result
        }, {})
    }

  } catch(err) {
    if (type === 'project') {
      console.log('Can not find entry file. Please check src/index.jsx exists.')
    } else if (type == 'component') {
      console.log('Can not find demo files. Please check demo/*.jsx exists.')
    }
    process.exit(1)
  }
}

function getRedfileOptions() {
  const redfileOptions = {}
  try {
    const redfile = require(path.join(cwd, 'redfile.json'))
    Object.assign(redfileOptions, redfile)
  } catch(err) {
    console.log(`${chalk.red('[ERROR]')} Can not find or open ${chalk.yellow('redfile.json')} here, please check.`)
    console.log(`${chalk.red('[ERROR]')} 找不到 ${chalk.yellow('redfile.json')} 文件，不是 Red-UI 项目，可能进入了错误的目录，请确认。`)
    debug(err.stack)
    process.exit(1)
  }
  return redfileOptions
}

// run
const redfile = getRedfileOptions()
const devType = redfile.type
const options = {
  cwd: cwd,
  entry: detectEntry(cwd, devType, redfile.spa),
  devType: devType,
  spa: redfile.spa
}

if (devType === 'project' && redfile.spa === false) {
  options.filename = '[name]/index.js'
}

if (devType === 'component') {
  console.log(`Start ${chalk.cyan('Component')} ${chalk.green('Development')} Mode.`)
  require('../lib/component-dev')(options)
} else if (devType === 'project') {
  console.log(`Start ${chalk.cyan('Project')} ${chalk.green('Development')} Mode.`)
  require('../lib/project-dev')(options)
} else {
  console.log('Unknown build type: %s in redfile.json', chalk.red(devType))
  process.exit(1)
}