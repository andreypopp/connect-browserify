{dirname, join, resolve, relative} = require 'path'
fs = require 'fs'

kew = require 'kew'
browserify = require 'browserify'
watchify = require 'watchify'
shim = require 'browserify-shim'
extend = require 'xtend'

relativize = (entry, requirement, extensions) ->
  expose = relative(dirname(entry), requirement)
  expose = expose.replace(/\.[a-z_\-]+$/, '')
  "./#{expose}"

once = (func) ->
  called = false
  (args...) ->
    return if called
    called = true
    func.call(this, args...)

isBrowserify = (x) ->
  x && (typeof x == 'object') and (typeof x.bundle == 'function')

isString = (x) ->
  Object::toString.call(x) == '[object String]'

module.exports = serve = (options, maybeOptions = {}) ->
  contentType = options.contentType or 'application/javascript'

  if isBrowserify(options)
    b = options
    options = maybeOptions
  else if isString(options)
    b = serve.bundle(entry: options)
    options = maybeOptions
  else
    b = serve.bundle(options)

  rendered = undefined

  bundle = ->
    rendered = kew.defer()
    b.bundle options, once (err, result) ->
      if err then rendered.reject(err) else rendered.resolve(result)

  bundle()

  unless options.watch == false
    w = watchify b
    w.on 'update', bundle

  (req, res, next) ->
    res.setHeader('Content-type', contentType)
    rendered
      .then (result) ->
        res.end(result)
      .fail next

serve.bundle = (options) ->
  baseDir = dirname(resolve(options.entry))

  b = browserify
    entries: [options.entry]
    extensions: options.extensions

  b.delay = options.bundleDelay or 300

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

  b

serve.serve = serve
