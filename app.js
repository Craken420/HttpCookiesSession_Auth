var express = require('express');
var logger = require('morgan');

var app = express();

// middelwares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes

// Main route
app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome to the HTTP authentication</h1>
    <a href="/secret">Secret</a>`)
});

function sendAuth (req, res, next) {
  var err = new Error("You are not authenticated");
  res.setHeader("WWW-Authenticate", "Basic");
  err.status = 401;
  next(err);
}

// Auth middleware
function auth (req, res, next) {
  var authHeader = req.headers.authorization;
  if (!authHeader)
    sendAuth(req, res, next);

  var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");
  var username = auth[0];
  var password = auth[1];
  if (username == "angelo" && password == "1234")
    next();
  else
    sendAuth(req, res, next)
}

// Secret content
app.get('/secret', auth, (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome You're Ahutorized</h1><br>
  <p> You can only see this after you've logged in</p>
  <a href="/">Home</a>`)
});

module.exports = app;
