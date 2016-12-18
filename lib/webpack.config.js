'use strict'
const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const WebpackWrapPlugin = require('./webpack.wrap.plugin')
const WebpackAutoinstallPlugin = require('./webpack.autoinstall.plugin')
const babelConfig = require('./babel.config')
const utils = require('./utils')
const spinner = utils.spinner
const concatLoaders = (...loaders) => loaders
                        .map(loader => require.resolve(loader + '-loader'))
                        .join('!')
const libFlexibleSource = fs.readFileSync(path.join(__dirname, 'lib.flexible.js'))
const libFlexibleCSSSource = fs.readFileSync(path.join(__dirname, 'lib.flexible.css'))

module.exports = (options) => {
  const cwd = options.cwd || process.cwd()
  const entry = options.entry
  const distPath = options.distPath
  const watch = options.watch || true
  const filename = options.filename || 'index.js'
  const extractedCss = new ExtractTextPlugin(`${filename.replace(/\.jsx?$/, '')}.css`)
  return {
    entry: entry,
    context: cwd,
    output: {
      path: distPath,
      filename: filename
    },
    watch: watch,
    resolve: {
      extensions: ['.js', '.json', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: require.resolve('babel-loader'),
          options: babelConfig
        },
        {
          test: /\.scss$/i,
          loader: extractedCss.extract([
            concatLoaders('css'),
            concatLoaders('sass')
          ])
        },
        {
          test: /\.css$/i,
          loader: extractedCss.extract(
            concatLoaders('css')
          )
        },
        {
          test: /\.less$/i,
          loader: extractedCss.extract([
            concatLoaders('css'),
            concatLoaders('less')
          ])
        },
        { test: /\.woff2?$/i, loader: concatLoaders('url'), options: { limit: 10000, mimetype: 'application/font-woff'} },
        { test: /\.ttf$/i, loader: concatLoaders('url'), options: { limit: 10000, mimetype: 'application/octet-stream'} },
        { test: /\.eot$/i, loader: concatLoaders('file') },
        { test: /\.svg$/i, loader: concatLoaders('url'), options: { limit: 10000, mimetype: 'image/svg+xml'} },
        { test: /\.(png|jpg|jpeg|gif|webp)$/i, loader: concatLoaders('url'), options: { limit: 10000 } },
        { test: /\.json$/i, loader: concatLoaders('json') },
        { test: /\.html?$/i, loader: concatLoaders('file'), options: { name: '[name].[ext]' } }
      ]
    },
    externals: {
      react: 'window.React',
      'react-dom': 'window.ReactDOM'
    },

    plugins: [
      new WebpackAutoinstallPlugin({
        peerDependencies: true,
        dev: false
      }),

      extractedCss,

      new webpack.ProgressPlugin((percentage, msg) => {
        if (msg === 'compiling') {
          spinner.text = "开始编译..."
          spinner.start()
        } else if (msg === 'building modules') {
          spinner.text = '构建模块...'
        } else if (msg === 'emitting') {
          spinner.text = '编译完成!'
          spinner.succeed()
        } else {
          spinner.text = msg
        }

      }),

      new WebpackWrapPlugin({
        header: (filename, compilerEntry) => {
          if (/\.js$/.test(filename)) {
            return `
${libFlexibleSource}
(function(scripts, callback){
  var count = 0;
  function asyncScript(url) {
    var script = document.createElement('script');
    script.onload = function() {
      count = count + 1;
      if (count === scripts.length) {
        callback();
      }
    }
    script.src = url;
    document.body.appendChild(script);
  }
  scripts.map(asyncScript);
})(['//g.alicdn.com/third/react/15.3.2/??react-with-addons.js,react-dom.js'], function() {
    /* RAW CODE STARTED HERE */`
          } else if (/\.css$/.test(filename)) {
            return libFlexibleCSSSource
          }
          return ''
        },
        footer: (filename, compilerEntry) => {
          if (/\.js$/.test(filename)) {
            return '});'
          }
          return ''
        }
      })
    ]
  }
}