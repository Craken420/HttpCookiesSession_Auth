// Dependencies
const cookie = require('cookie'), // Cookie analyzer
      url = require('url'),
      escapeHTML = require('escape-html');

const controller = {};

// Methods
controller.main = (req, res) => {
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
};

controller.logout = (req, res) => {
  req.headers.authorization = undefined;
  res.clearCookie('user').redirect('/');
};

controller.setCookie = (req, res) => { // new cookie
  res.cookie('cookie_name', 'cookie_value',{expire : new Date() + 9999})
    .redirect('/cookies');
};

controller.setSignCookie = (req, res) => {
  let cookieVal = 'sing-cookie_value';
  res.cookie('sign-cookie_name', cookieVal, // new cookie
    { signed: true, expire : new Date() + 9999 }) // add sign and expire
    .redirect('/cookies');
};

controller.signCookieWithParam = (req, res) => {
  let {name, val} =
    url.parse(req.url, true, true).query; // get params
  res.cookie(String(name), String(val), { signed: true } ) // make and sign cookie
    .redirect('/cookies');
};

controller.clearCookieByName = (req, res) => {
  let query = url.parse(req.url, true, true).query;
  res.clearCookie( String(query.name) ) // delete
    .redirect('/cookies');
};

controller.clearAllCookies = (req, res) => {
  Object.getOwnPropertyNames(req.cookies)
    .concat(Object.getOwnPropertyNames(req.signedCookies))
    .forEach(cookieName => res.clearCookie(cookieName) );
  res.redirect('/');
};

controller.expireHeaderCookieByName = (req, res) => {
  let query = url.parse(req.url, true, true).query;
  res.cookie(String(query.name), '', {expires: new Date(0)});
  res.redirect('/cookies');
};

controller.expireCookies = (req, res) => {
  let eCookie = req.cookies;
  for (var prop in eCookie) {
    if ( !eCookie.hasOwnProperty(prop))
      continue;
    res.cookie(prop, '', {expires: new Date(0)});
  }
  res.redirect('/');
};

controller.onRequest = (req, res) => {
  let query = url.parse(req.url, true, true).query; // url string to object
  if (query && query.cookieName) {
    /* Send a new cookie
    *  String(query.name): Angelo; cokie.seriaze: name=Angelo */
    res.setHeader('Set-Cookie', cookie.serialize('cookieName', String(query.cookieName)), {
        httpOnly: true,
        maxAge: 3 //60 * 60 * 60 * 24 * 7 // 1 semana en segundos
    })
    res.statusCode = 302;
    res.setHeader('Location',
      req.headers.refer || '/cookies/request'); // Redirect after set the cookie
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
};

module.exports = controller;
