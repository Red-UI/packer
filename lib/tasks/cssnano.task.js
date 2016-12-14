'use strict'

const fs = require('fs')
const path = require('path')
const cssnano = require('cssnano')
const chalk = require('chalk')
const utils = require('../utils')
const getAllFiles = utils.getAllFiles
const beautifulSize = utils.beautifulSize
const notice = utils.notice

module.exports = (distPath) => {
  const cssFiles = getAllFiles(distPath, /\.css$/)

  return Promise.all(cssFiles.map((cssFile) => {
    const stat = fs.statSync(cssFile)
    return cssnano.process(fs.readFileSync(cssFile), {})
      .then((result) => {
        fs.writeFileSync(cssFile, result.css)
        notice(`压缩样式: ${chalk.red(beautifulSize(stat.size))} -> ${chalk.red(beautifulSize(result.css.length))} ${cssFile}`)
      })
  }))
}