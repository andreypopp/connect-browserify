// Generated by CoffeeScript 1.6.2
(function() {
  var browserify, fs, path, relativize, shim;

  require('fibrous');

  path = require('path');

  fs = require('fs');

  browserify = require('browserify');

  shim = require('browserify-shim');

  relativize = function(entry, requirement, extensions) {
    var expose;

    expose = path.relative(path.dirname(entry), requirement);
    expose = expose.replace(/\.[a-z_\-]+$/, '');
    return "./" + expose;
  };

  exports.bundle = function(options, cb) {
    var b, expose, k, requirement, transform, v, _i, _j, _len, _len1, _ref, _ref1, _ref2;

    b = browserify([options.entry], {
      extensions: options.extensions
    });
    if (options.shims != null) {
      _ref = options.shims;
      for (k in _ref) {
        v = _ref[k];
        v.path = path.join(path.dirname(path.resolve(options.entry)), v.path);
      }
      b = shim(b, options.shims);
    }
    if (options.transforms != null) {
      _ref1 = options.transforms;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        transform = _ref1[_i];
        b.transform(transform);
      }
    }
    if (options.requirements != null) {
      _ref2 = options.requirements;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        requirement = _ref2[_j];
        expose = relativize(options.entry, requirement);
        b.require(requirement, {
          expose: expose
        });
      }
    }
    return b.bundle(options, cb);
  };

  exports.serve = function(options) {
    var dirname, extensions, isApp, render, rendered;

    render = function() {
      return exports.future.bundle(options);
    };
    extensions = ['.js'].concat(options.extensions || []);
    isApp = RegExp("(" + (extensions.map(function(x) {
      return x.replace('.', '\\.');
    }).join('|')) + ")$");
    dirname = path.dirname(path.resolve(options.entry));
    rendered = render();
    fs.watch(dirname, {
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
