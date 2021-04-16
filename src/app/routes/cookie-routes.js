// Dependencies
const router = require('express').Router(),
      middleware = require('../middlewares/routes-middlewares'),
      Ctrl = require('../controllers/cookie-controller');

// Middlewares
router.use(middleware.authCookie);

// Routes
router.get('/', Ctrl.main);
router.get('/logout', Ctrl.logout);
router.get('/setCookie', Ctrl.setCookie);
router.get('/setSignCookie', Ctrl.setSignCookie);
router.get('/signCookieWithParam', Ctrl.signCookieWithParam);
router.get('/clearCookieByName', Ctrl.clearCookieByName);
router.get('/clearAllCookies', Ctrl.clearAllCookies);
router.get('/expireHeaderCookieByName',Ctrl.expireHeaderCookieByName);
router.get('/expireCookies', Ctrl.expireCookies);
router.get('/request', Ctrl.onRequest);

module.exports = router;
