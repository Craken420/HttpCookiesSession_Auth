var express = require('express');
var logger = require('morgan');

var app = express();

// middelwares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes

// Main route
app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome to the HTTP authentication</h1>
    <form method="GET" action="/login">
      <input placeholder="enter your username" name="username">
      <input placeholder="enter your password" name="password">
      <input type="submit" value="Set session">
    </form>`)
});

// Login route
app.get('/login', function(req, res) {
  let username = req.query.username;
  let password = req.query.password;
  if (!username || !password)
    res.send('No data');
  if (username == "angelo" && password == "1234")
    res.redirect('/secret');
  else
    res.send('Login Fail');
});

// Secret content
app.get('/secret', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>Welcome You're Ahutorized</h1><br>
  <p> You can only see this after you've logged in</p>
  <a href="/">Home</a>`)
});

module.exports = app;
