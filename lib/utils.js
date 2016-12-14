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