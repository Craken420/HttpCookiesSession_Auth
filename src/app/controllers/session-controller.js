// Dependencies
const cookie = require('cookie'); // Cookie analyzer

const controller = {};

// Methods
controller.main = (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || ''); // Parse the cookies on the request
  const sessionid = cookies['session-id']; // Get the visitor name set in the cookie

  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome to sessions controller</h1>
    <p>Cookies: ${JSON.stringify(cookies)}</p>
    <p>Session: ${(req.session.user||'visitor')}</p>
    <p>Cookies.session-id:  ${(sessionid || 'undefined')}</p>
    <p>req.headers.authorization:  ${JSON.stringify(req.headers.authorization)}</p>`);

  if (req.session.views) {
    req.session.views++;
    res.write(`<p>Session Views: ${req.session.views}</p>`);
  } else
    req.session.views = 1;

  if (req.session.user)
    res.write(`<a href="/session">Sesion</a><br/>`);
  if (cookies.user)
    res.write(`<a href="/cookies">Cookies</a><br/>`);
  res.end('<a href="/">Home</a><br/>');
};

controller.logout = (req, res) => {
  req.session.destroy();
  req.headers.authorization = undefined;
  res.clearCookie('session-id');
  res.send(`
  <script>
      alert("Session destroyed!!");
      window.location.href = "/"
  </script>`);
  res.end();
};

module.exports = controller;
