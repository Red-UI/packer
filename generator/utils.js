'use strict'

const mkdirp = require('mkdirp')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const extractFile = (fileContent, dist) => {
  if (!fs.existsSync(dist)) {
    mkdirp.sync(path.dirname(dist))
  }
  fs.writeFileSync(dist, fileContent)
}

const generateRedfile = (redfile) => {
  fs.writeFileSync('./redfile.json', JSON.stringify(redfile, null, 2))
}

exports.generate = (type, options, redfile) => {
  const fileList = require(`./${type}/fileList`)(options)
  generateRedfile(redfile)

  Object.keys(fileList).forEach((filename) => {
    const defaultOptions = fileList[filename]
    const renderData = Object.assign(defaultOptions, options)
    const sourcePath = path.resolve(__dirname, type, 'templates', filename)
    const result = ejs.render(fs.readFileSync(sourcePath, 'utf-8'), renderData)
    const distFilePath = renderData._dist || filename
    extractFile(result, distFilePath)
    console.log('Extracting: ', chalk.green(distFilePath))
  })

  return 'done'
}