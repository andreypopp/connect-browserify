path        = require 'path'
assert      = require 'assert'
express     = require 'express'
req         = require 'supertest'
browserify  = require 'browserify'
middleware  = require '../index'

fixture = (name) ->
  path.join(__dirname, 'fixtures', name)

assertWorks = (app, done) ->
  req(app)
    .get('/bundle.js')
    .expect(200)
    .expect('Content-type', 'application/javascript')
    .end (err, res) ->
      return done(err) if err
      assert.ok /sourceMappingURL/.exec(res.text)
      assert.ok /module.exports = 'dep'/.exec(res.text)
      done()

describe 'connect-browserify', ->

  it 'works (configured with module id)', (done) ->
    app = express()
    app.use '/bundle.js', middleware(fixture('main.js'), debug: true)
    assertWorks(app, done)

  it 'works (configured with options object)', (done) ->
    app = express()
    app.use '/bundle.js', middleware(entry: fixture('main.js'), debug: true)
    assertWorks(app, done)

  it 'works (configured with browserify instance)', (done) ->
    app = express()
    app.use '/bundle.js', middleware(browserify(fixture('main.js')), debug: true)
    assertWorks(app, done)
