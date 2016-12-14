'use strict'

const chalk = require('chalk')
const path = require('path')
const MemoryFS = require('memory-fs')
const clean = require('./tasks/clean.task')
const webpack = require('./tasks/webpack.task')

module.exports = (options) => {
  const cwd = options.cwd
  const entry = options.entry
  const distPath = path.resolve(cwd, 'dist')
  const filename = options.filename
  const memFs = new MemoryFS()
  options.fs = memFs

  return clean(distPath)
    .then(() => webpack({
      cwd: cwd,
      entry: entry,
      distPath: distPath,
      filename: filename,
      outputFileSystem: memFs
    }))
    .then(() => require('../server')(options))
    .catch((err) => {
      console.log(err.stack)
    })
}