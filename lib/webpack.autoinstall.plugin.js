'use strict'

const MemoryFS = require("memory-fs")
const webpack = require("webpack")
const fs = require("fs")
const spawn = require("cross-spawn")
const path = require("path")
const chalk = require('chalk')
const EXTERNAL = /^\w[a-z\-0-9.]+$/ // Match "react", "path", "fs", "lodash.random", etc.
const defaultOptions = { dev: false, peerDependencies: true }
const erroneous = []
const externals = [] // webpack config externals

const installer = {
  check: (request) => {
    if (!request) {
      return
    }

    const namespaced = request.charAt(0) === "@"
    const dep = request.split("/")
      .slice(0, namespaced ? 2 : 1)
      .join("/")

    // Ignore relative modules, which aren't installed by NPM
    if (!dep.match(EXTERNAL) && !namespaced) {
      return
    }

    try {
      const pkgPath = require.resolve(path.join(process.cwd(), "package.json"))
      const pkg = require(pkgPath)
      // Remove cached copy for future checks
      delete require.cache[pkgPath]
      const depInstalledPath = require.resolve(path.join(process.cwd(), 'node_modules', dep, "package.json"))
      const depInstalled = require(depInstalledPath)
      delete require.cache[depInstalledPath]
      const hasDep = pkg.dependencies && pkg.dependencies[dep]
      const hasDevDep = pkg.devDependencies && pkg.devDependencies[dep]
      // Bail early if we've already installed this dependency
      if (depInstalled && (hasDep || hasDevDep)) {
        return
      }
    } catch(err) {
    }

    // Ignore linked modules
    // support npminstall@1 linked to .npminstall/
    // support npminstall@2 linked to .x.y.x@module
    try {
      const depPath = path.join(process.cwd(), "node_modules", dep)
      const stats = fs.lstatSync(depPath)

      if (stats.isSymbolicLink()) {
        const realPath = fs.realpathSync(depPath)
        const isNpminstallV1 = realPath.indexOf(path.resolve(depPath, '../.npminstall') === 0)
        const isNpminstallV2 = /node_modules\/\.[0-9]+[^@]*@/.test(realPath)
        if (isNpminstallV1 || isNpminstallV2) {
          // ignore
        } else {
          return
        }
      }
    } catch(e) {
      // Module exists in node_modules, but isn't symlinked
    }

    // Ignore NPM global modules (e.g. "path", "fs", etc.)
    try {
      const resolved = require.resolve(dep)

      // Global modules resolve to their name, not an actual path
      if (resolved.match(EXTERNAL)) {
        return
      }
    } catch(e) {
      // Module is not resolveable
    }

    return dep
  },

  // check if cwd/package.json exists
  checkPackage: () => {
    try {
      require.resolve(path.join(process.cwd(), "package.json"));

      return;
    } catch (e) {
      // package.json does not exist
    }

    console.info("Initializing `%s`...", "package.json");
    spawn.sync("cnpm", ["init", "-y"], { stdio: "inherit" });
  },

  defaultOptions: defaultOptions,

  install: (deps, options) => {
    if (!deps) {
      return;
    }

    if (!Array.isArray(deps)) {
      deps = [deps];
    }

    options = Object.assign({}, defaultOptions, options)

    // Ignore known, erroneous modules
    deps = deps.filter((dep) => {
      try {
        const depName = /^(@?[^@]+)/.exec(dep)[0]
        // dep is not in neither erroneous or externals
        return !erroneous.includes(depName) && !externals.includes(depName)
      } catch(e) {
        return true
      }
    })

    if (!deps.length) {
      return
    }

    const args = ["install"].concat(deps).filter(Boolean);

    args.push(options.dev ? "--save-dev" : "--save")

    deps.forEach((dep) => console.info(`📦 Installing ${chalk.red(dep)}...`))

    // Ignore input, capture output, show errors
    const output = spawn.sync("cnpm", args, {
      stdio: ["ignore", "pipe", "inherit"]
    })

    if (output.status) {
      deps.forEach((dep) => {
        erroneous.push(dep)
      })
    }

    const peers = []
    deps.forEach((dep) => {
      try {
        const depName = /^(@?[^@]+)/.exec(dep)[0]
        const pkgJson = require(path.join(process.cwd(), 'node_modules', depName, 'package.json'))
        const peerDep = pkgJson.peerDependencies
        if (peerDep) {
          Object.keys(peerDep).forEach((peer) => {
            if (externals.includes(peer)) { return }
            const version = peerDep[peer]
            if (version && version.match(' ')) {
              peers.push(peer)
            } else {
              peers.push(`${peer}@${version}`)
            }
          })
        }
      } catch(e) {}
    })

    if (options.peerDependencies && peers.length) {
      console.info("Installing peerDependencies...");
      this.install(peers, options);
      console.info("");
    }

    return output;
  }
}

const depFromErr = (err) => {
  if (!err) {
    return
  }

  /**
   * Supported package formats:
   * - path
   * - react-lite
   * - @cycle/core
   * - bootswatch/lumen/bootstrap.css
   * - lodash.random
   */
  const matches = /(?:(?:Cannot resolve module)|(?:Can't resolve)) '([@\w\/.-]+)' in/.exec(err)

  if (!matches) {
    return
  }

  return matches[1]
}

// constructor init
function NpmInstallPlugin(options) {
  this.preCompiler = null
  this.compiler = null
  this.options = Object.assign(installer.defaultOptions, options)
  this.resolving = {}

  installer.checkPackage() // check if cwd/package.json exists
}

NpmInstallPlugin.prototype.apply = function(compiler) {
  this.compiler = compiler

  // Recursively install missing dependencies so primary build doesn't fail
  compiler.plugin("watch-run", this.preCompile.bind(this))

  // Install externals that wouldn't normally be resolved
  if (Array.isArray(compiler.options.externals)) {
    compiler.options.externals.unshift(this.resolveExternal.bind(this))
  }
  externals.push.apply(externals, Object.keys(compiler.options.externals || {}))
  // Install project dependencies on demand
  compiler.plugin('compilation', (compilation) => {
    compilation.resolvers.normal.plugin("module", this.resolveModule.bind(this))
  })
  // compiler.
};

NpmInstallPlugin.prototype.install = function(result) {
  if (!result) {
    return
  }

  const dep = installer.check(result.request)

  if (dep) {
    let dev = this.options.dev

    if (typeof this.options.dev === "function") {
      dev = !!this.options.dev(result.request, result.path)
    }

    installer.install(dep, Object.assign({}, this.options, { dev: dev }))
  }
}

NpmInstallPlugin.prototype.preCompile = function(compilation, next) {
  if (!this.preCompiler) {
    const options = this.compiler.options;

    const config = Object.assign(
      // Start with new config object
      {},
      // Inherit the current config
      options,
      {
        // Ensure fresh cache
        cache: false,
        plugins: [
          new NpmInstallPlugin(this.options)
        ],
        performance: undefined
      }
    )
    this.preCompiler = webpack(config)
    this.preCompiler.outputFileSystem = new MemoryFS()
  }

  this.preCompiler.run(next)
}

NpmInstallPlugin.prototype.resolveExternal = function(context, request, callback) {
  // Only install direct dependencies, not sub-dependencies
  if (context.match("node_modules")) {
    return callback();
  }

  // Ignore !!bundle?lazy!./something
  if (request.match(/(\?|\!)/)) {
    return callback();
  }

  const result = {
    context: {},
    path: context,
    request: request,
  }

  this.resolve(result, (err, filepath) => {
    if (err) {
      this.install(Object.assign({}, result, { request: depFromErr(err) }))
    }

    callback()
  })
}

NpmInstallPlugin.prototype.resolve = function(result, callback) {
  const version = require("webpack/package.json").version;
  const major = version.split(".").shift();

  if (major === "1") {
    return this.compiler.resolvers.normal.resolve(
      result.path,
      result.request,
      callback
    );
  }

  if (major === "2") {
    return this.compiler.resolvers.normal.resolve(
      result.context || {},
      result.path,
      result.request,
      callback
    );
  }

  throw new Error("Unsupport Webpack version: " + version);
}

NpmInstallPlugin.prototype.resolveModule = function(result, next) {
  // Only install direct dependencies, not sub-dependencies
  if (result.path.match("node_modules")) {
    return next()
  }

  if (this.resolving[result.request]) {
    return next()
  }

  this.resolving[result.request] = true

  this.resolve(result, (err, filepath) => {
    // this.resolving[result.request] = false
    if (err) {
      this.install(Object.assign({}, result, { request: depFromErr(err) }))
    }

    return next()
  })
}

module.exports = NpmInstallPlugin