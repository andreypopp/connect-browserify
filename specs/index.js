'use strict';

var path        = require('path');
var assert      = require('assert');
var express     = require('express');
var req         = require('supertest');
var through     = require('through');
var browserify  = require('browserify');
var middleware  = require('../index');

function fixture(name) {
  return path.join(__dirname, 'fixtures', name);
}

var moreSemiColons = through(function(chunk) {
  this.queue(chunk.toString('utf8').replace(/;/g, ';;'));
});

function assertWorks(app, done) {
  req(app)
    .get('/bundle.js')
    .expect(200)
    .expect('Content-type', 'application/javascript')
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      assert.ok(/sourceMappingURL/.exec(res.text), 'source map missing');
      assert.ok(/module.exports = 'dep'/.exec(res.text), 'dep module missing');
      done(null, res.text);
    });
}

describe('connect-browserify', function() {

  it('works (configured with module id)', function(done) {
    var app = express();
    app.use('/bundle.js', middleware(fixture('main.js'), {debug: true}));
    assertWorks(app, done);
  });

  it('works (configured with options object)', function(done) {
    var app = express();
    app.use('/bundle.js', middleware({entry: fixture('main.js'), debug: true}));
    assertWorks(app, done);
  });

  it('works (configured with browserify instance)', function(done) {
    var app = express();
    app.use(
      '/bundle.js',
      middleware(browserify(fixture('main.js')), {debug: true}));
    assertWorks(app, done);
  });

  it('works (configured with bundle function)', function(done) {
    var app = express();
    app.use(
      '/bundle.js',
      middleware({
        entry: fixture('main.js'),
        bundle: function(b) {
          b.external('some-file.js');
          return b;
        },
        debug: true
      }));
    assertWorks(app, done);
  });

  it('allows post-bundle transforms via pipe', function(done) {
    var app = express();
    app.use(
      '/bundle.js',
      middleware({
        entry: fixture('main.js'),
        debug: true,
        pipes: function(stream) {
          return stream.pipe(moreSemiColons);
        }
      })
    );
    assertWorks(app, function(err, js) {
      if (err) {
        return done(err);
      }
      assert.ok(/;;/.exec(js), 'post-transform not applied');
      done();
    });
  });

  it('provides access to watchify instance', function(done) {
    var app = express();
    var handler = middleware({
      entry: fixture('main.js'),
      watch: true,
      debug: true
    });
    app.use('/bundle.js', handler);
    handler.watchify.on('time', function(time) {
      assert.ok(time);
      assertWorks(app, done);
    });
  });

  it('should expose build errors', function(done) {
    var app = express();
    var handler = middleware({
      entry: fixture('broken.js'),
      onError: makeRequest
    });
    app.use('/bundle.js', handler);
    // Add express error catching middleware
    app.use(function(err, req, res, next) {
      res.status(500).send(err.stack);
      // silence unused var warning
      next = !next;
    });
    // Let the promise resolve as error before making a request
    function makeRequest(capturedError) {
      req(app)
        .get('/bundle.js')
        .expect(500)
        .end(function(err, res) {
          if (err) {
            done(err);
          }
          assert.ok(capturedError, 'expected error in onerror');
          assert.equal(res.text, capturedError.stack);
          done();
        });
    }
  });

});

