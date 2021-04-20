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

router.get('/users', middleware.authToken, (req, res) => res.send('Protected content'));

module.exports = router;
