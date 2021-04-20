// Dependencies
const cookie = require('cookie'); // Cookie analyzer

const controller = {};
var Users = [];

// Methods
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

// www auth with fixed user
controller.secretContent = (req, res) => {
  console.log('secretContent-Users: ', Users);
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

// Sign up in array user with Form
controller.signup = (req, res) => {
  let exist = false;
  console.log('signup-Users: ', Users);
  if (!req.body.id || !req.body.password)
    res.render('./session/signupOrLogin', {message: "Please enter both id and password",
      route: '/session/signup', back: '/session'});
  else {
    Users.filter( (user) => (user.id === req.body.id) ? exist = true : exist = false );
    if (!exist) {
      var newUser = {id: req.body.id, password: req.body.password};
      Users.push(newUser);
      req.session.user = newUser;
      controller.secretContent(req, res);
    } else
      res.render('session/signupOrLogin', {
        message: 'User Already Exists! Login or choose another user id',
        route: '/session/signup', back: '/session'});
  }
};

controller.login = (req, res) => {
  console.log('login-Users: ', Users);
  let exist = false;
  if(!req.body.id || !req.body.password)
    res.render('./session/signupOrLogin', {message: "Please enter both id and password",
      route: '/session/login', back: '/session'});
  else {
    Users.filter((user) => {
      if (user.id === req.body.id && user.password === req.body.password) {
        exist = true;
        req.session.user = user;
      } else
        exist = false
    });

    if (!exist)
      res.render('./session/signupOrLogin',
        { message: "Invalid credentials!", route: '/session/login', back: '/session'});
    else
      controller.secretContent(req, res);
  }
};

controller.getUsers = () => Users

module.exports = controller;
