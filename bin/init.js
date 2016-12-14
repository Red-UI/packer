#!/usr/bin/env node

const utils = require('../lib/utils')
const path = require('path')
const program = require('commander')
const inquirer = require('inquirer')
const cwd = process.cwd()
const chalk = require('chalk')
const spawn = require('cross-spawn')
const checkIsRedProject = utils.checkIsRedProject
/*
 * 执行流程：
 * 1. 检测文件夹是否为空
 * 1.1 空文件夹：选择
 */
const distPath = path.resolve(cwd, process.argv[2] || '.')

console.log(chalk.cyan('初始化 RedUI 项目...'))
if (checkIsRedProject(cwd)) {
  console.log()
  console.log(chalk.red('检测到已是 RedUI 项目, 请执行 red dev'))
  process.exit(1)
}
inquirer
  .prompt([
    {
      type: 'list',
      name: 'type',
      message: '请选择项目类型：',
      choices: [
        { name: '独立项目（单页面应用）', value: 'spa' },
        { name: '独立项目（传统多页面）', value: 'tradition' },
        new inquirer.Separator(),
        { name: 'Red-UI 可复用组件', value: 'component' }
      ]
    },
    {
      type: 'input',
      name: 'name',
      message: '请输入项目名称：',
      default: () => path.basename(distPath)
    },
    {
      type: 'input',
      name: 'author',
      message: '请输入作者名称：'
    }
  ])
  .then((answers) => {
    const redfile = {
      name: answers.name,
      author: answers.author,
      options: {}
    }

    switch (answers.type) {
      case 'spa':
        Object.assign(redfile, { type: 'project', spa: true })
        break
      case 'tradition':
        Object.assign(redfile, { type: 'project', spa: false })
        break
      case 'component':
      default:
        Object.assign(redfile, { type: 'component', spa: false })
    }
    Promise.resolve(require(`../generator/utils`).generate(answers.type, answers, redfile))
      .then(() => {
        console.log()
        console.log(chalk.cyan('项目文件创建完成，开始安装依赖...'))
        spawn.sync('cnpm', ['install'], { stdio: 'inherit' })
      })
      .then(() => {
        console.log()
        console.log(chalk.cyan('依赖安装完成，启动 dev 服务器...'))
        spawn.sync('red-dev', [], { stdio: 'inherit' })
      })
  })