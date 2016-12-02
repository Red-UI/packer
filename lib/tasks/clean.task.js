'use strict'
const rimraf = require('rimraf')

module.exports = (cleanPath) => {
  return new Promise((resolve, reject) => {
    rimraf(cleanPath, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve('cleaned')
      }
    })
  })
}