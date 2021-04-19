// Dependencies
const cookie = require('cookie');

const controller = {};

// Methods
controller.main = (req, res) => {
    res.render('index', { title: 'Welcome to the HTTP authentication',
        cookies: cookie.parse(req.headers.cookie || ''),
        req: req
    });
}

controller.showSecretContent = (req, res) => {
    res.render('http/httpSecret', { title: 'Welcome Youre Ahutorized' });
}

module.exports = controller;
