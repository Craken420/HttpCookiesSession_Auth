// Dependencies
const cookie = require('cookie'), // Cookie analyzer
      url = require('url'),
      escapeHTML = require('escape-html');

const controller = {};

// Methods
controller.main = (req, res) => {
  res.render('cookies/cookies', { title: 'Welcome to cookies controller', req: req});
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
  const cookies = cookie.parse(req.headers.cookie || '')
  res.render('./cookies/onRequest', { name: cookies.cookieName });
};

module.exports = controller;
