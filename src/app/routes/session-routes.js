const session = require('express-session'),
      fileStore = require('session-file-store')(session),
      router = require('express').Router(),
      middleware = require('../middlewares/routes-middlewares'),
      Ctrl = require('../controllers/session-controller');

// Settings
var cookiedata = { 
  domain         : 'localhost',
  originalMaxAge : null,
  httpOnly       : true,
  path           : '/session'
};

const sessOpc = {
  name: 'session-id',
  secret: '123456xxx',
  saveUninitialized: false,
  resave: false,
  cookie: cookiedata,
  retries: 0, // don't search expired sessions
  // store: new fileStore({logFn: function(){}}) // don't show log of files not found
}

if (router.get('env') === 'production') {
  router.set('trust proxy', 1) // trust first proxy
  sessOpc.cookie.secure = true // serve secure cookies 'cause it won't be set by client
}

// Middlewares
router.use(session(sessOpc))

// Routes
router.get('/', (req, res) => { res.render('session/session', {title: 'Login with Sessions', req: req} )});

// www auth with fixed user
router.get('/secretFixedSession', middleware.authFixedSession, Ctrl.secretContent);

// session auth basic from a form
router.get('/signup', (req, res) => res.render('session/signupOrLogin',
  {title: 'Welcome to signup', route: '/session/signup'}));
router.post('/signup', Ctrl.signup);

router.get('/login', (req, res) => res.render('session/signupOrLogin',
  {title: 'Welcome to login', route: '/session/login'}));

router.post('/login', Ctrl.login);

router.get('/secretSession', middleware.authSession, Ctrl.secretContent);

router.get('/logout', Ctrl.logout);

module.exports = router;
