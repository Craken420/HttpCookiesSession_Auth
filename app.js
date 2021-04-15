// Dependencies
var express = require('express'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    fileStore = require('session-file-store')(session);

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

function authSession (req, res, next) {
  if  (!req.session.user) { // Check user session
    authResu = getAuth(req, res, next);
    if (authResu.username == "session" && authResu.password == "1234") {
      req.session.user = authResu.username    // Send user session
      req.session.password = authResu.password // Send user session
      next();
    }
    else
      sendAuth(req, res, next);
  }
  else {
    if (req.session.user == 'session') // Using the user cookies
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
    <a href="/cookieSecret">Cookie Secret</a><br/>
    <a href="/sessionSecret">Session Secret</a>`)
});

// Secret content
app.get('/httpSecret', auth, showSecretContent);
app.get('/cookieSecret', authCookie, showSecretContent);

const sessionRouter = express.Router();

sessionRouter.use(session({
  name:'session-id',
  secret:'123456xxx',
  saveUninitialized: false,
  resave: false,
  retries: 0, // No intente buscar sesiones caducadas
  store: new fileStore({logFn: function(){}}) // No mostrar el logger de archivos no encontrados
}))

sessionRouter.get('/sessionSecret', authSession, showSecretContent)

app.use('/', sessionRouter)

module.exports = app;
