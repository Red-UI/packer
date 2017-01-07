'use strict'
const lodash = require('lodash')
const { camelCase, kebabCase } = lodash

module.exports = (answers) => {
  const name = answers.name
  const camelComponentName = camelCase(name).replace(/[\w]/, ($1) => $1.toUpperCase())
  const kebabComponentName = kebabCase(name)

  return {
    'package.json': {},
    'gitignore': {
      _dist: '.gitignore',
    },
    'readme.md': {},

    'demo/simple.jsx': {
      camelComponentName,
      kebabComponentName
    },

    'src/Component.jsx': {
      _dist: `src/${camelComponentName}.jsx`,
      camelComponentName,
      kebabComponentName
    },
    'src/Component.less': {
      _dist: `src/${camelComponentName}.less`,
      camelComponentName,
      kebabComponentName
    },

    'src/index.js': {
      camelComponentName,
      kebabComponentName
    }
  }
}