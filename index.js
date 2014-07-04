'use strict';

var path        = require('path');
var dirname     = path.dirname;
var relative    = path.relative;

var Promise     = require('bluebird');
var concat      = require('concat-stream');
var browserify  = require('browserify');
var watchify    = require('watchify');

function relativize(entry, requirement) {
  var expose = relative(dirname(entry), requirement);
  expose = expose.replace(/\.[a-z_\-]+$/, '');
  return "./" + expose;
}

function isBrowserify(x) {
  return x && (typeof x === 'object') &&
    (typeof x.bundle === 'function') &&
    (typeof x.plugin === 'function') &&
    (typeof x.transform === 'function');
}

function isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}

function serve(options, maybeOptions) {
  var b;
  var rendered;

  if (!maybeOptions) {
    maybeOptions = {};
  }

  var contentType = options.contentType || 'application/javascript';
  var pipes = options.pipes || function(x) { return x; };
  var onError = options.onError || function() { };

  if (isBrowserify(options)) {
    b = options;
    options = maybeOptions;
  } else if (isString(options)) {
    b = serve.bundle({entry: options});
    options = maybeOptions;
  } else {
    b = serve.bundle(options);
  }

  function make() {
    rendered = new Promise(function(resolve, reject) {
      var output = pipes(b.bundle(options));
      output.on('error', reject);
      output.pipe(concat({encoding: 'string'}, resolve));
    });
    rendered.catch(onError);
  }

  make();

  var middleware = function(req, res, next) {
    res.setHeader('Content-type', contentType);
    return rendered.then(function(result) {
      return res.end(result);
    }).catch(next);
  };

  if (options.watch !== false) {
    var w = watchify(b);
    w.on('update', make);
    middleware.watchify = w;
  }

  return middleware;
}

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
    b = options.bundle(b);
  }

  return b;
}

module.exports = serve;
module.exports.serve = serve;
module.exports.bundle = bundle;
