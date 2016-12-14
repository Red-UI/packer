'use strict'
const ora = require('ora')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')

exports.spinner = ora({ spinner: 'monkey' })

exports.repl = (config) => {
  const stdout = process.stdout
  const stdin = process.stdin

  return new Promise((resolve, reject) => {
    stdout.write(config.description)
    stdin.resume()
    stdin.setEncoding('utf-8')
    stdin.on('data', (chunk) => {
      if (chunk === "\n") {
        chunk = config.default || ''
      } else {
        chunk = chunk.replace(/[\s\n]/, '')
      }
      if (chunk !== 'y' && chunk !== 'Y' && chunk !== 'n' && chunk !== 'N') {
        console.log(chalk.red('您输入的命令是：' + chunk));
        console.warn(chalk.red('请输入正确指令：y/n'));
        process.exit(1)
      }
      stdin.pause()
      resolve(chunk)
    })
  })
}

exports.checkIsRedProject = (dir) => {
  return fs.existsSync(path.resolve(dir, 'redfile.json'))
}

exports.getAllFiles = function (dir, filter) {
  const result = []

  ;(function _find(_dir) {
    const files = fs.readdirSync(_dir)
    for (let file of files) {
      const fullFile = path.join(_dir, file)
      const stat = fs.statSync(fullFile)
      if (stat.isDirectory()) {
        _find(fullFile)
      } else {
        result.push(fullFile)
      }
    }
  })(dir)

  return filter ? result.filter((file) => filter.test(file)) : result
}

exports.notice = console.log.bind(console, chalk.green('[NOTICE] '))
exports.error = console.log.bind(console, chalk.red('[ERROR] '))

exports.beautifulSize = (size) => {
  if (size < 1024) {
    return size + ' Byte'
  } else if (size < 1024 * 1024) {
    return (size / ( 1024 )).toFixed(2) + 'KiB'
  } else {
    return (size / ( 1024 * 1024)).toFixed(2) + 'MiB'
  }
}