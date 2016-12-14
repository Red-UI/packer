'use strict'

const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const clean = require('./tasks/clean.task')
const webpack = require('./tasks/webpack.task')
const uglify = require('./tasks/uglify.task')
const cssnano = require('./tasks/cssnano.task')

module.exports = (options) => {
  const cwd = options.cwd
  const entry = options.entry
  const distPath = path.resolve(cwd, 'dist')
  const filename = options.filename

  return clean(distPath)
    .then(() => webpack({
      cwd: cwd,
      entry: entry,
      distPath: distPath,
      filename: filename
    }))
    .then(() => Promise.all([uglify(distPath), cssnano(distPath)]))
    .then(() => {
      console.log(chalk.cyan('编译完成。'))
      process.exit(0)
    })
    .catch((err) => {
      console.log(err.stack)
    })
}