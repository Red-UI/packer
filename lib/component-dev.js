'use strict'
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const MemoryFS = require('memory-fs')
const clean = require('./tasks/clean.task')
const webpack = require('./tasks/webpack.task')

module.exports = (options) => {
  const cwd = options.cwd
  const entry = options.entry
  const distPath = path.resolve(cwd, 'dist')
  const memFs = new MemoryFS()

  return clean(distPath)
    .then(() => webpack({
      cwd: cwd,
      entry: entry,
      distPath: distPath,
      filename: '[name].js',
      outputFileSystem: memFs
    }))
    .then(() => require('../server')({
      cwd: cwd,
      port: options.port,
      type: 'component',
      fs: memFs
    }))
    .catch((err) => {
      console.log(err.stack)
    })
}