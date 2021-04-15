// Dependencies
var express = require('express'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    cookie = require('cookie'), // Analizador de cookies
    url = require('url'),
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
  <a href="/cookie">Cookie</a><br/>
  <a href="/session">Session</a>
  <a href="/">Home</a>`)
}

// Routes
// Main route
app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome to the HTTP authentication</h1>
    <a href="/httpSecret">Http Secret</a><br/>
    <a href="/cookies">Cookie Secret</a><br/>
    <a href="/sessionSecret">Session Secret</a><br/>`)
  const cookies = cookie.parse(req.headers.cookie || '');
  if (cookies.user)
      res.write(`<a href="/cookies/logout">Logout</a>`);
  res.end();
});

// Secret content
app.get('/httpSecret', auth, showSecretContent);

const cookiesRouter = express.Router();

cookiesRouter.get('/', authCookie, (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome to cookies controller</h1>
    <p>req.headers.cookie: ${req.headers.cookie}</p>
    <p>req.cookies: ${JSON.stringify(req.cookies)}</p>
    <p>req.signedCookies: ${JSON.stringify(req.signedCookies)}</p>
    <p>req.headers.authorization:  ${JSON.stringify(req.headers.authorization)}</p>
    <form method="GET" action="/cookies/signCookieWithParam">
      <input placeholder="enter your cookie name" name="name">
      <input placeholder="enter your cookie val" name="val">
      <input type="submit" value="Generete Sign Cookie With Param">
    </form>
    <form method="GET" action="/cookies/clearCookieByName">
      <input placeholder="enter your cookie name" name="name">
      <input type="submit" value="Clear Cookie">
    </form>
    <a href="/cookies/setCookie">Generete cookie</a><br/>
    <a href="/cookies/setSignCookie">Generete Sign Cookie</a><br/>
    <a href="/cookies/clearAllCookies">Clear All Cookies</a><br/>
    <a href="/">Home</a><br/>`);
  const cookies = cookie.parse(req.headers.cookie || '');
  if (cookies.user)
    res.write(`<a href="/cookies/logout">Logout</a>`);
    res.end();
});
cookiesRouter.get('/logout', authCookie, (req, res) => {
  res.clearCookie('user').redirect('/');
});
cookiesRouter.get('/setCookie', (req, res) => { // definir una nueva cookie
  res.cookie('cookie_name', 'cookie_value',{expire : new Date() + 9999})
    .redirect('/cookies');});

cookiesRouter.get('/setSignCookie', (req, res) => {
  let cookieVal = 'sing-cookie_value';
  res.cookie('sign-cookie_name', cookieVal, // definir una nueva cookie
      { signed: true, expire : new Date() + 9999 }) // firmar y agregar expiracion
      .redirect('/cookies');
});
cookiesRouter.get('/signCookieWithParam', (req, res) => {
  let {name, val} =
      url.parse(req.url, true, true).query; // Extraer parametros
  res.cookie(String(name), String(val), { signed: true } ) // Crear y firmar cookie
    .redirect('/cookies');
});
cookiesRouter.get('/clearCookieByName', (req, res) => {
  let query = url.parse(req.url, true, true).query;
  res.clearCookie( String(query.name) ) // Eliminar
      .redirect('/cookies');
});
cookiesRouter.get('/clearAllCookies',(req, res) => {
  Object.getOwnPropertyNames(req.cookies)
    .concat(Object.getOwnPropertyNames(req.signedCookies))
    .forEach(cookieName => {
        res.clearCookie(cookieName); // Eliminar
    });
  res.redirect('/cookies');
});

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
app.use('/cookies', cookiesRouter)

module.exports = app;
