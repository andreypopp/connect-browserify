require 'fibrous'
{dirname, join, resolve, relative} = require 'path'
fs = require 'fs'
browserify = require 'browserify'
shim = require 'browserify-shim'
extend = require 'xtend'

relativize = (entry, requirement, extensions) ->
  expose = relative(dirname(entry), requirement)
  expose = expose.replace(/\.[a-z_\-]+$/, '')
  "./#{expose}"

exports.bundle = (options, cb) ->
  baseDir = dirname(resolve(options.entry))
  b = browserify([options.entry], extensions: options.extensions)

  if options.shims?
    shims = {}
    for k, v of options.shims
      shims[k] = extend {}, v, {path: join(baseDir, v.path)}
    b = shim(b, shims)

  if options.transforms?
    for transform in options.transforms
      b.transform(transform)

  if options.requirements?
    for requirement in options.requirements
      expose = relativize(options.entry, requirement)
      b.require(requirement, expose: expose)

  b.bundle(options, cb)

exports.serve = (options) ->
  render = -> exports.future.bundle(options)
  extensions = ['.js'].concat(options.extensions or [])
  isApp = ///(#{extensions.map((x) -> x.replace('.', '\\.')).join('|')})$///
  baseDir = dirname(resolve(options.entry))

  rendered = render()

  fs.watch baseDir, {persistent: false}, (ev, filename) ->
    rendered = render() if isApp.test filename

  (req, res, next) ->
    rendered.resolve (err, result) ->
      if err? then throw err else res.end(result)
