'use strict'

const chalk = require('chalk')
const path = require('path')

const clean = require('./tasks/clean.task')
const webpack = require('./tasks/webpack.task')

module.exports = (options) => {
  const cwd = options.cwd
  const entry = options.entry
  const distPath = path.resolve(cwd, 'dist')

  return clean(distPath)
    .then(() => webpack({ cwd: cwd, entry: entry }))
    .catch((err) => {
      console.log(err.stack)
    })
}