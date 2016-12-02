const yargs = require('yargs')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const cwd = process.cwd()

function detectEntry(cwd, type) {
  try {
    if (type === 'project') {
      const srcFiles = fs.readdirSync(path.join(cwd, 'src')) || []
      const entry = srcFiles.filter((filename) => /^index.jsx?$/.test(filename))
        .map((filename) => path.join(cwd, 'src', filename))
      if (entry.length === 0) {
        throw new Error('Entry Not Found')
      }
      return entry
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

module.exports = (redfile) => {
  const devType = redfile.type
  const options = {
    cwd: cwd,
    entry: detectEntry(cwd, devType)
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
}