#!/usr/bin/env node

var path = require('path');
var express = require('express');
var browserify = require('../index');

var app = express();
app.use(browserify.serve({entry: path.join(__dirname, 'a.js')}));
app.listen(3000);
