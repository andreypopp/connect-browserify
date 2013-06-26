{dirname, join, resolve, relative} = require 'path'
fs = require 'fs'

Q = require 'kew'
browserify = require 'browserify'
shim = require 'browserify-shim'
extend = require 'xtend'

relativize = (entry, requirement, extensions) ->
  expose = relative(dirname(entry), requirement)
  expose = expose.replace(/\.[a-z_\-]+$/, '')
  "./#{expose}"

module.exports = serve = (options) ->
  render = -> serve.bundle(options)

  extensions = ['.js'].concat(options.extensions or [])
  isApp = ///(#{extensions.map((x) -> x.replace('.', '\\.')).join('|')})$///
  baseDir = dirname(resolve(options.entry))
  contentType = options.contentType or 'application/javascript'
  watch = if options.watch is undefined then true else options.watch

  rendered = render()

  if watch
    fs.watch baseDir, {persistent: false}, (ev, filename) ->
      rendered = render() if isApp.test filename

  (req, res, next) ->
    res.setHeader('Content-type', contentType)
    rendered
      .then (result) ->
        res.end(result)
      .fail next

serve.bundle = (options) ->
  promise = Q.defer()
  baseDir = dirname(resolve(options.entry))
  b = browserify([options.entry])

  if options.extensions?
    for extension in options.extensions
      b.extension(extension)

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

  if options.bundle?
    bundle = options.bundle(bundle)

  b.bundle options, (err, result) ->
    if err then promise.reject(err) else promise.resolve(result)

  promise

serve.serve = serve
