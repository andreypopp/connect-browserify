// Generated by CoffeeScript 1.6.2
(function() {
  var browserify, dirname, extend, fs, join, relative, relativize, resolve, shim, _ref;

  require('fibrous');

  _ref = require('path'), dirname = _ref.dirname, join = _ref.join, resolve = _ref.resolve, relative = _ref.relative;

  fs = require('fs');

  browserify = require('browserify');

  shim = require('browserify-shim');

  extend = require('xtend');

  relativize = function(entry, requirement, extensions) {
    var expose;

    expose = relative(dirname(entry), requirement);
    expose = expose.replace(/\.[a-z_\-]+$/, '');
    return "./" + expose;
  };

  exports.bundle = function(options, cb) {
    var b, baseDir, expose, k, requirement, shims, transform, v, _i, _j, _len, _len1, _ref1, _ref2, _ref3;

    baseDir = dirname(resolve(options.entry));
    b = browserify([options.entry], {
      extensions: options.extensions
    });
    if (options.shims != null) {
      shims = extend({}, options.shims);
      _ref1 = options.shims;
      for (k in _ref1) {
        v = _ref1[k];
        shims[k].path = join(baseDir, v.path);
      }
      b = shim(b, shims);
    }
    if (options.transforms != null) {
      _ref2 = options.transforms;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        transform = _ref2[_i];
        b.transform(transform);
      }
    }
    if (options.requirements != null) {
      _ref3 = options.requirements;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        requirement = _ref3[_j];
        expose = relativize(options.entry, requirement);
        b.require(requirement, {
          expose: expose
        });
      }
    }
    return b.bundle(options, cb);
  };

  exports.serve = function(options) {
    var baseDir, extensions, isApp, render, rendered;

    render = function() {
      return exports.future.bundle(options);
    };
    extensions = ['.js'].concat(options.extensions || []);
    isApp = RegExp("(" + (extensions.map(function(x) {
      return x.replace('.', '\\.');
    }).join('|')) + ")$");
    baseDir = dirname(resolve(options.entry));
    rendered = render();
    fs.watch(baseDir, {
      persistent: false
    }, function(ev, filename) {
      if (isApp.test(filename)) {
        return rendered = render();
      }
    });
    return function(req, res, next) {
      return rendered.resolve(function(err, result) {
        if (err != null) {
          throw err;
        } else {
          return res.end(result);
        }
      });
    };
  };

}).call(this);

/*
//@ sourceMappingURL=index.map
*/
