// Dependencies
const router = require('express').Router(),
      middleware = require('../middlewares/routes-middlewares'),
      Ctrl = require('../controllers/index-controller');

// Routes
router.get('/', Ctrl.main);
router.get('/httpSecret', middleware.basicAuth, Ctrl.showSecretContent); // Secret content

module.exports = router;
