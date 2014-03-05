var path        = require('path');
var dirname     = path.dirname;
var join        = path.join;
var resolve     = path.resolve;
var relative    = path.relative;

var fs          = require('fs');
var kew         = require('kew');
var browserify  = require('browserify');
var watchify    = require('watchify');
var extend      = require('xtend');

function relativize(entry, requirement, extensions) {
  var expose = relative(dirname(entry), requirement);
  expose = expose.replace(/\.[a-z_\-]+$/, '');
  return "./" + expose;
};

function once(func) {
  var called = false;

  return function() {
    if (called) {
      return;
    }
    called = true;
    return func.apply(this, arguments);
  };
};

function isBrowserify(x) {
  return x && (typeof x === 'object') && (typeof x.bundle === 'function');
};

function isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
};

function serve(options, maybeOptions) {
  var b;
  var rendered;

  if (!maybeOptions) {
    maybeOptions = {};
  }

  var contentType = options.contentType || 'application/javascript';

  if (isBrowserify(options)) {
    b = options;
    options = maybeOptions;
  } else if (isString(options)) {
    b = serve.bundle({entry: options});
    options = maybeOptions;
  } else {
    b = serve.bundle(options);
  }

  function bundle() {
    var localRendered = rendered = kew.defer();
    return b.bundle(options, once(localRendered.makeNodeResolver()));
  };

  bundle();

  if (options.watch !== false) {
    var w = watchify(b);
    w.on('update', bundle);
  }

  return function(req, res, next) {
    res.setHeader('Content-type', contentType);
    return rendered.then(function(result) {
      return res.end(result);
    }).fail(next);
  };
};

function bundle(options) {
  var b = browserify({
    entries: [options.entry],
    extensions: options.extensions
  });

  b.delay = options.bundleDelay || 300;

  if (options.transforms) {
    options.transforms.forEach(function(transform) {
      b.transform(transform);
    });
  }

  if (options.requirements) {
    options.requirements.forEach(function(requirement) {
      var expose = relativize(options.entry, requirement);
      b.require(requirement, {
        expose: expose
      });
    });
  }

  if (options.bundle) {
    b = options.bundle(bundle);
  }

  return b;
};

module.exports = serve;
module.exports.serve = serve;
module.exports.bundle = bundle;
