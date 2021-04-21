var express = require('express');
var router = express.Router();
var middleware = require('../middlewares/routes-middlewares')
var Ctrl = require('../controllers/jwt-controller');

router.get('/', (req, res) => res.render('jwt/jwtMain',
    {title: 'JWT authenticate'}));

router.route('/signup')
  .get((req, res) => res.render('session/signupOrLogin',
      {title: 'Welcome to auth token signup', route: '/authJwt/signup', back: '/authJwt'}))
  .post(Ctrl.signup);

router.route('/signin')
    .get((req, res) => res.render('session/signupOrLogin', {title: 'Lets signin you',
        route: '/authJwt/signin', back: '/authJwt'}))
    .post(Ctrl.authenticate);

router.get('/users', middleware.authToken, (req, res) =>
    res.send( Ctrl.getUsers() ) );

module.exports = router;
