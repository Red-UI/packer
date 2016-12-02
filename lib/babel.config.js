'use strict'
const path = require('path')

module.exports = {
  presets: ['es2015', 'stage-0', 'react'].map((preset) => require.resolve(`babel-preset-${preset}`)),
  plugins: ['add-module-exports'].map((plugin) => require.resolve(`babel-plugin-${plugin}`))
}