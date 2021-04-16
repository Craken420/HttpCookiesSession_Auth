const controller = {};

// Methods
controller.main = (req, res, next) => {
    res.render('index', { title: 'Welcome to the HTTP authentication' });
}

controller.showSecretContent = (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.write(`<h1>Welcome You're Ahutorized</h1><br>
    <p> You can only see this after you've logged in</p>
    <a href="/cookies">Cookie</a><br/>
    <a href="/session">Session</a><br/>
    <a href="/">Home</a>`)
}

module.exports = controller;
