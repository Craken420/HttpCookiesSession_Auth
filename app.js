// Dependencies
var express = require('express'),
    createError = require('http-errors'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    cookie = require('cookie'), // Cookie analyzer
    escapeHTML = require('escape-html'),
    url = require('url'),
    path = require('path'),
    session = require('express-session'),
    fileStore = require('session-file-store')(session);

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middelwares
app.use( logger('dev') );
app.use( express.json() );
app.use( express.urlencoded({ extended: false }) );
app.use( cookieParser('secret-key') );
app.use(express.static(path.join(__dirname, 'public')));

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

function auth (req, res, next) { // Auth middleware
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
  <a href="/cookies">Cookie</a><br/>
  <a href="/session">Session</a><br/>
  <a href="/">Home</a>`)
}

app.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to the HTTP authentication' });
});

// Routes
app.get('/', function(req, res) { // Main route
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome to the HTTP authentication</h1>
    <a href="/httpSecret">Http Secret</a><br/>
    <a href="/cookies">Cookie Secret</a><br/>
    <a href="/session">Session Secret</a><br/>`)
  const cookies = cookie.parse(req.headers.cookie || '');
  if (cookies.user)
    res.write(`<a href="/cookies/logout">Cookie Logout</a><br/>`);
  if (cookies['session-id'])
    res.write(`<a href="/session/logout">Session Logout</a>`);
  res.end();
});

app.get('/httpSecret', auth, showSecretContent); // Secret content

const cookiesRouter = express.Router();

cookiesRouter.use(authCookie);

cookiesRouter.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome to cookies controller</h1>
    <p>req.headers.cookie: ${req.headers.cookie}</p>
    <p>req.cookies: ${JSON.stringify(req.cookies)}</p>
    <p>req.signedCookies: ${JSON.stringify(req.signedCookies)}</p>
    <p>req.headers.authorization:  ${JSON.stringify(req.headers.authorization)}</p>
    <form method="GET" action="/cookies/signCookieWithParam">
      <input placeholder="enter your cookie name" name="name" required>
      <input placeholder="enter your cookie val" name="val" required>
      <input type="submit" value="Generete Sign Cookie With Param">
    </form>
    <form method="GET" action="/cookies/clearCookieByName">
      <input placeholder="enter your cookie name" name="name" required>
      <input type="submit" value="Clear Cookie">
    </form>
    <form method="GET" action="/cookies/expireHeaderCookieByName">
      <input placeholder="enter your cookie name" name="name" required>
      <input type="submit" value="Expire Cookie">
    </form>
    <a href="/cookies/setCookie">Generete cookie</a><br/>
    <a href="/cookies/setSignCookie">Generete Sign Cookie</a><br/>
    <a href="/cookies/clearAllCookies">Clear All Cookies</a><br/>
    <a href="/cookies/expireCookies">Expire Cookies</a><br/>
    <a href="/cookies/request">Request</a><br/>
    <a href="/session">Sessions</a><br/>
    <a href="/">Home</a><br/>`);
  const cookies = cookie.parse(req.headers.cookie || '');
  if (cookies.user)
    res.write(`<a href="/cookies/logout">Logout</a>`);
    res.end();
});
cookiesRouter.get('/logout', (req, res) => {
  req.headers.authorization = undefined;
  res.clearCookie('user').redirect('/');
});
cookiesRouter.get('/setCookie', (req, res) => { // new cookie
  res.cookie('cookie_name', 'cookie_value',{expire : new Date() + 9999})
    .redirect('/cookies');});

cookiesRouter.get('/setSignCookie', (req, res) => {
  let cookieVal = 'sing-cookie_value';
  res.cookie('sign-cookie_name', cookieVal, // new cookie
      { signed: true, expire : new Date() + 9999 }) // add sign and expire
      .redirect('/cookies');
});
cookiesRouter.get('/signCookieWithParam', (req, res) => {
  let {name, val} =
      url.parse(req.url, true, true).query; // get params
  res.cookie(String(name), String(val), { signed: true } ) // make and sign cookie
    .redirect('/cookies');
});
cookiesRouter.get('/clearCookieByName', (req, res) => {
  let query = url.parse(req.url, true, true).query;
  res.clearCookie( String(query.name) ) // delete
      .redirect('/cookies');
});
cookiesRouter.get('/clearAllCookies', (req, res) => {
  Object.getOwnPropertyNames(req.cookies)
    .concat(Object.getOwnPropertyNames(req.signedCookies))
    .forEach(cookieName => {
        res.clearCookie(cookieName); // delete
    });
  res.redirect('/cookies');
});
cookiesRouter.get('/expireHeaderCookieByName', (req, res) => {
  let query = url.parse(req.url, true, true).query;
  res.cookie(String(query.name), '', {expires: new Date(0)});
  res.redirect('/cookies');
});
cookiesRouter.get('/expireCookies', (req, res) => {
  let eCookie = req.cookies;
  for (var prop in eCookie) {
      if (!eCookie.hasOwnProperty(prop)) {
          continue;
      }
      res.cookie(prop, '', {expires: new Date(0)});
  }
  res.redirect('/');
});

cookiesRouter.get('/request', (req, res) => {
  let query = url.parse(req.url, true, true).query; // url string to object
  if (query && query.cookieName) {
      /* Send a new cookie
      *  String(query.name): Angelo; cokie.seriaze: name=Angelo */
      res.setHeader('Set-Cookie', cookie.serialize('cookieName', String(query.cookieName)), {
          httpOnly: true,
          maxAge: 3 //60 * 60 * 60 * 24 * 7 // 1 semana en segundos
      })
      res.statusCode = 302;
      res.setHeader('Location', req.headers.refer
        || '/cookies/request'); // Redirect after set the cookie
      res.end();
      return;
  }

  /*
  * Get the request cookie form and parse to object
  * Example: req.headers.cookie: name=Angelo; PARSE cookies:  { name: 'Angelo' }
  */
  const cookies = cookie.parse(req.headers.cookie || '')
  const name = cookies.cookieName // Get the cookie user name

  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  if (name)
      res.write('<p>Welcome back, <b>' + escapeHTML(name) + '</b>!</p>')
  else
      res.write('<p>Hello new visitor</p>')
  res.write(`<form method="GET">
          <input placeholder="enter your name" name="cookieName">
          <input type="submit" value="Set Name">
      </form>
      <a href="/cookies">Cookies</a><br/>
      <a href="/session">Sessions</a><br/>`)
  res.end('<a href="/">Home</a>')
});

const sessionRouter = express.Router();

var cookiedata = { 
  domain         : 'localhost',
  originalMaxAge : null,
  httpOnly       : true,
  path           : '/session'
};

const sessOpc = {
  name:'session-id',
  secret:'123456xxx',
  saveUninitialized: false,
  resave: false,
  cookie: cookiedata,
  retries: 0, // don't search expired sessions
  store: new fileStore({logFn: function(){}}) // don't show log of files not found
}

if (sessionRouter.get('env') === 'production') {
  sessionRouter.set('trust proxy', 1) // trust first proxy
  sessOpc.cookie.secure = true // serve secure cookies 'cause it won't be set by client
}

sessionRouter.use(session(sessOpc))

sessionRouter.use(authSession);

sessionRouter.get('/', (req, res) => {
 
  const cookies = cookie.parse(req.headers.cookie || ''); // Parse the cookies on the request
  const sessionid = cookies['session-id']; // Get the visitor name set in the cookie

  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome to sessions controller</h1>
    <p>Cookies: ${JSON.stringify(cookies)}</p>
    <p>Session: ${(req.session.user||'visitor')}</p>
    <p>Cookies.session-id:  ${(sessionid || 'undefined') }</p>
    <p>req.headers.authorization:  ${JSON.stringify(req.headers.authorization)}</p>`);

  if (req.session.views) {
    req.session.views++;
    res.write(`<p>Session Views: ${req.session.views}</p>`);
  } else
    req.session.views = 1;

  if (req.session.user)
    res.write(`<a href="/session/logout">Logout</a><br/>
      <a href="/cookies">Cookies</a><br/>`);
  res.end('<a href="/">Home</a><br/>');
});

sessionRouter.get('/logout', (req, res) => {
  req.session.destroy();
  req.headers.authorization = undefined;
  res.clearCookie('session-id');
  res.send(`
  <script>
      alert("Session destroyed!!");
      window.location.href = "/"
  </script>`);
  res.end();
});

app.use('/session', sessionRouter)
app.use('/cookies', cookiesRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
