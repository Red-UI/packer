'use strict'

const fs = require('fs')
const path = require('path')
const uglify = require('uglify-js')
const chalk = require('chalk')
const utils = require('../utils')
const getAllFiles = utils.getAllFiles
const beautifulSize = utils.beautifulSize
const notice = utils.notice

function uglifyAsync(jsFile) {
  return new Promise((resolve, reject) => {
    try {
      const stat = fs.statSync(jsFile)
      const result = uglify.minify(jsFile)
      fs.writeFileSync(jsFile, result.code)
      notice(`压缩脚本: ${chalk.red(beautifulSize(stat.size))} -> ${chalk.red(beautifulSize(result.code.length))} ${jsFile}`)
      resolve('done')
    } catch (err){
      err.jsFile = jsFile
      reject(err)
    }
  })
}

module.exports = (distPath) => {
  const jsFiles = getAllFiles(distPath, /\.js$/)
  return Promise.all(jsFiles.map((jsFile) => uglifyAsync(jsFile)))
}