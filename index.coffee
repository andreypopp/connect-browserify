require 'fibrous'
path = require 'path'
fs = require 'fs'
browserify = require 'browserify'
shim = require 'browserify-shim'

relativize = (entry, requirement, extensions) ->
  expose = path.relative(path.dirname(entry), requirement)
  expose = expose.replace(/\.[a-z_\-]+$/, '')
  "./#{expose}"

exports.bundle = (options, cb) ->
  b = browserify([options.entry], extensions: options.extensions)

  if options.shims?
    for k, v of options.shims
      v.path = path.join(path.dirname(path.resolve(options.entry)), v.path)
    b = shim(b, options.shims)

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
  dirname = path.dirname(path.resolve(options.entry))

  rendered = render()

  fs.watch dirname, {persistent: false}, (ev, filename) ->
    rendered = render() if isApp.test filename

  (req, res, next) ->
    rendered.resolve (err, result) ->
      if err? then throw err else res.end(result)
