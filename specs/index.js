'use strict';

var path        = require('path');
var assert      = require('assert');
var express     = require('express');
var req         = require('supertest');
var browserify  = require('browserify');
var middleware  = require('../index');

function fixture(name) {
  return path.join(__dirname, 'fixtures', name);
}

function assertWorks(app, done) {
  req(app)
    .get('/bundle.js')
    .expect(200)
    .expect('Content-type', 'application/javascript')
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      assert.ok(/sourceMappingURL/.exec(res.text))
      assert.ok(/module.exports = 'dep'/.exec(res.text));
      done();
    });
};

describe('connect-browserify', function() {

  it('works (configured with module id)', function(done) {
    app = express();
    app.use('/bundle.js', middleware(fixture('main.js'), {debug: true}));
    assertWorks(app, done);
  });

  it('works (configured with options object)', function(done) {
    app = express();
    app.use('/bundle.js', middleware({entry: fixture('main.js'), debug: true}));
    assertWorks(app, done);
  });

  it('works (configured with browserify instance)', function(done) {
    app = express();
    app.use('/bundle.js', middleware(browserify(fixture('main.js')), {debug: true}));
    assertWorks(app, done);
  });

  it('provides access to watchify instance', function(done) {
    app = express();
    handler = middleware({entry: fixture('main.js'), watch: true, debug: true});
    app.use('/bundle.js', handler);
    handler.watchify.on('time', function(time) {
      assertWorks(app, done)
    });
  });
});

