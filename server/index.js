'use strict'

const browserSync = require("browser-sync")
const serveIndex = require('serve-index')
const path = require('path')
const mime = require('mime')
const ejs = require('ejs')
const fs = require('fs')
const blacklist = {
  'node_modules': true
}
const bs = browserSync.create()

module.exports = exports = (options) => {
  const cwd = options.cwd
  const port = options.port || 3333
  const customFs = options.fs || fs
  const index = serveIndex(cwd, { icons: true, view: 'details' })

  const middlewares = [
    // map /dist to memFs
    {
      route: '/dist', // per-route
      handle: (req, res, next) => {
        if (req.url === '/') {
          return res.end('This is dist directory.')
        }
        const filePath = path.join(cwd, 'dist', req.url)
        try {
          const file = customFs.readFileSync(filePath)
          res.setHeader('Content-Type', mime.lookup(filePath))
          res.end(file)
        } catch(err) {
          res.end(`File: ${filePath} Not found.`)
        }
      }
    },

    (req, res, next) => {
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
    }
  ]

  if (options.type === 'component') {
    // component dev need handle
    // /demo/*.jsx map to html

    const demoTemplate = ejs.compile(fs.readFileSync(path.join(__dirname, './assets/demo.ejs.html'), 'utf-8'), {})
    middlewares.unshift({
      route: '/demo',
      handle: (req, res, next) => {
        if (/\.jsx$/.test(req.url)) {
          const chunkName = (req.url.match(/\/([^\.]+)/) || [, ''])[1]
          const demoHtml = demoTemplate({
            title: `DEMO-${chunkName}`,
            script: `/dist/demo/${chunkName}.js`,
            style: `/dist/demo/${chunkName}.css`
          })
          res.setHeader('Content-Type', 'text/html')
          res.end(demoHtml)
        } else {
          next()
        }
      }
    })
  }

  /**
   * handle favicon.ico
   */
  middlewares.unshift(
    (req, res, next) => {
      if (/favicon\.ico$/i.test(req.url)) {
        return res.end('')
      } else {
        next()
      }
    }
  )
  bs.init({ 
    server: cwd,
    port: port,
    open: true,
    middleware: middlewares
  })

  return bs
}

exports.browserSync = bs