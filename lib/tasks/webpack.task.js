const webpack = require('webpack')
const getWebpackConfig = require('../webpack.config.js')
const browserSync = require('../../server').browserSync
const path = require('path')

module.exports = (options) => {
  const webpackConfig = getWebpackConfig(options)

  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig)

    if (options.outputFileSystem) {
      compiler.outputFileSystem = options.outputFileSystem
    }

    compiler.watch({
      aggregateTimeout: 300, // wait so long for more changes
      poll: true // use polling instead of native watchers
    }, (err, stats) => {
      if (err) {
        reject(err)
      } else {
        console.log('')
        console.log(stats.toString({
          colors: true,
          timings: true,
          chunks: false,
          version: false,
          hash: false,
          reasons: true,
          children: false,
          assets: true
        }))
        console.log('')

        browserSync.reload() // emit reload

        resolve(stats)
      }
    })
  })
}