const jwt = require('jsonwebtoken');

const controller = {};
const config = require('../configs/config');

const AuthUsers = [];

// Sign up in array user with Form
controller.signup = (req, res) => {
  let exist = false;
  console.log('signup-AuthUsers: ', AuthUsers);
  if (!req.body.id || !req.body.password)
    res.render('./session/signupOrLogin', {message: "Please enter both id and password",
      route: '/authJwt/signup', back: '/authJwt'});
  else {
    AuthUsers.filter( (user) => (user.id === req.body.id) ? exist = true : exist = false );
    if (!exist) {
      var newUser = {id: req.body.id, password: req.body.password};
      let token = jwt.sign(newUser, config.llave, { expiresIn: 1440 });
      newUser.token = token;
      AuthUsers.push(newUser);

      res.cookie('token', token);
      res.redirect('/authJwt/users');
    } else
      res.render('session/signupOrLogin', {
        message: 'User Already Exists! Login or choose another user id',
        route: '/authJwt/signup', back: '/authJwt'});
  }
};

module.exports = controller;
