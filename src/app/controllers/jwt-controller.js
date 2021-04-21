const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const controller = {};
const config = require('../configs/config');

const AuthUsers = [];

controller.getUsers = () => AuthUsers;

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

      const myHeader = new fetch.Headers({
        'Authorization': token
      });

      const myInit = {
        method: 'GET',
        headers: myHeader,
        mode: 'cors',
        cache: 'default'
      };

      const myRequest = new fetch.Request('http://localhost:3000/authJwt/users', myInit);

      fetch(myRequest)
        .then (response => response.json())
        .then (data => {
          res.send(data)
      })
    } else
      res.render('session/signupOrLogin', {
        message: 'User Already Exists! Login or choose another user id',
        route: '/authJwt/signup', back: '/authJwt'});
  }
};

controller.authenticate = (req, res) => {
  console.log('login-Users: ', AuthUsers);
  let exist = false;
  if(!req.body.id || !req.body.password)
    res.render('./session/signupOrLogin', {message: "Please enter both id and password",
      route: '/authJwt/signin', back: '/authJwt'});
  else {
    let token = '';
    AuthUsers.filter((user) => {
      if (user.id === req.body.id && user.password === req.body.password) {
        exist = true;
        token = user.token;
      } else
        exist = false
    });

    if (!exist)
      res.render('./session/signupOrLogin',
        { message: "Invalid credentials!", route: '/authJwt/signin', back: '/authJwt'});
    else {
      const myHeader = new fetch.Headers({
        'Authorization': token
      });

      const myInit = {
        method: 'GET',
        headers: myHeader,
        mode: 'cors',
        cache: 'default'
      };

      const myRequest = new fetch.Request('http://localhost:3000/authJwt/users', myInit);

      fetch(myRequest)
        .then (response => response.json())
        .then (data => {
          res.send(data)
      })
    }
  }
};

module.exports = controller;
