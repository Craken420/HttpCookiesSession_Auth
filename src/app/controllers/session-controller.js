// Dependencies
const cookie = require('cookie'); // Cookie analyzer

const controller = {};

// Methods
controller.secretContent = (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || ''); // Parse the cookies on the request
  if (req.session.views)
    req.session.views++;
  else
    req.session.views = 1;
  res.render('./session/secret', { title: 'Welcome to session controller',
    req: req,
    cookies: cookies,
    sessionid: cookies['session-id'] // Get the visitor name set in the cookie
  });
};

controller.logout = (req, res) => {
  req.session.destroy();
  req.headers.authorization = undefined;
  res.clearCookie('session-id');
  res.send(`
  <script>
      alert("Session destroyed!!");
      window.location.href = "/session"
  </script>`);
  res.end();
};

module.exports = controller;
