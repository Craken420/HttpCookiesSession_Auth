var express = require('express');
var logger = require('morgan');

var app = express();

// middelwares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes

// GET home page
app.get('/', function(req, res) {
  res.send('Welcome to the HTTP authentication');
});

module.exports = app;
