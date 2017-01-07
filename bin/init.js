#!/usr/bin/env node

const utils = require('../lib/utils')
const path = require('path')
const program = require('commander')
const inquirer = require('inquirer')
const cwd = process.cwd()
const chalk = require('chalk')
const spawn = require('cross-spawn')
const pkg = require('../package.json')
const checkIsRedProject = utils.checkIsRedProject
const distPath = path.resolve(cwd, process.argv[2] || '.')
/*
 * 执行流程：
 * 1. 检测 cwd 是否含有 redfile.json
 * 1.1 有，提示 + 退出
 * 1.2 没有，继续
 * 2. 输入项目基本信息
 * 3. 调用对应的 generator
 * 4. 安装依赖
 * 5. 启动 red dev
 */
program
  .version(pkg.version, '-v, --version')
  .parse(process.argv)

console.log(chalk.green('[NOTICE] ') + chalk.cyan('初始化 RedUI 项目...'))
if (checkIsRedProject(cwd)) {
  console.log()
  console.log(chalk.green('[NOTICE] ') + chalk.red('检测到已是 RedUI 项目, 请执行 red dev'))
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
      default: () => path.basename(distPath),
      validate: (name, answers) => {
        const type = answers.type
        if (type === 'component') {
          if (/^redui-(\w+)/.test(name)) {
            return true
          } else {
            return chalk.underline(name) + ' 不符合规则，例：redui-tab'
          }
        } else {
          return name !== ''
        }
      }
    },
    {
      type: 'input',
      name: 'description',
      message: '请输入项目简介：'
    },
    {
      type: 'input',
      name: 'author',
      message: '请输入作者名称：',
      default: () => {
        try {
          const name = spawn.sync('git', ['config', 'user.name']).stdout.toString()
          return name.replace('\n', '')
        } catch(err) {
          return ''
        }
      }
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
    return Promise.resolve(require(`../generator/utils`).generate(answers.type, answers, redfile))
  })
  .then(() => {
    console.log()
    console.log(chalk.green('[NOTICE] ') + chalk.cyan('项目文件创建完成，开始安装依赖...'))
    spawn.sync('cnpm', ['install'], { stdio: 'inherit' })
  })
  .then(() => {
    console.log()
    console.log(chalk.green('[NOTICE] ') + chalk.cyan('依赖安装完成，启动 dev 服务器...'))
    spawn.sync('red-dev', [], { stdio: 'inherit' })
  })
  .catch((e) => {
      console.trace(e)
  })