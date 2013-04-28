#!/usr/bin/env coffee
path = require 'path'
connect = require 'connect'
browserify = require '../index'

app = connect()
app.use browserify.serve
  entry: path.join(__dirname, 'a.js')
app.use connect.errorHandler()

connect.createServer(app).listen(3000)
