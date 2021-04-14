var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser')

var app = express();

// Middelwares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('secret-key'));

// WWW-Authenticate
function sendAuth (req, res, next) {
  var err = new Error("You are not authenticated");
  res.setHeader("WWW-Authenticate", "Basic");
  err.status = 401;
  next(err);
}

function getAuth(req, res, next) {
  var authHeader = req.headers.authorization;
  if (!authHeader)
    sendAuth(req, res, next);

  var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");
  return {username: auth[0], password: auth[1]}
}
// Auth middleware
function auth (req, res, next) {
  authResu = getAuth(req, res, next);
  if (authResu.username == "angelo" && authResu.password == "1234")
    next();
  else
    sendAuth(req, res, next);
}

function authCookie (req, res, next) {
  if (!req.signedCookies.user) { // Check sign cookies
    authResu = getAuth(req, res, next);
    if (authResu.username == "cookie" && authResu.password == "1234") {
      res.cookie('user', authResu.username, {signed:true}); // Send user cookies
      next();
    }
    else
      sendAuth(req, res, next);
  }
  else {
    if(req.signedCookies.user == 'cookie') // Using the user cookies
      next();
    else
      sendAuth(req, res, next);
  }
}

// Controllers
function showSecretContent (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome You're Ahutorized</h1><br>
  <p> You can only see this after you've logged in</p>
  <a href="/">Home</a>`)
}

// Routes
// Main route
app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome to the HTTP authentication</h1>
    <a href="/httpSecret">Http Secret</a><br/>
    <a href="/cookieSecret">Cookie Secret</a>`)
});

// Secret content
app.get('/httpSecret', auth, showSecretContent);
app.get('/cookieSecret', authCookie, showSecretContent);

module.exports = app;
