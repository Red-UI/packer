'use strict'

const browserSync = require("browser-sync")
const serveIndex = require('serve-index')
const path = require('path')
const fs = require('fs')
const blacklist = {
  'node_modules': true
}
const bs = browserSync.create()

module.exports = exports = (options) => {
  const cwd = options.cwd
  const port = options.port || 3333
  const index = serveIndex(cwd, { icons: true, view: 'details' })

  bs.init({ 
    server: cwd,
    port: port,
    middleware: [
      (req, res, next) => {
        if (/favicon\.ico$/i.test(req.url)) {
          return res.end('')
        }
        try {
          const stat = fs.statSync(path.join(cwd, req.url))
          if (stat.isDirectory()) {
            index(req, res)
          } else {
            next()
          }
        } catch(err) {
          next()
        }
      },

      (req, res, next) => {
        const requestPath = path.join(cwd, req.url)
        try {
          const files = fs.readdirSync(requestPath).filter((filename) => filename[0] !== '.' && !blacklist[filename])
          res.end(files.toString())
        } catch(err) {
          next()
        }
      }
    ]
  })

  return bs
}

exports.browserSync = bs