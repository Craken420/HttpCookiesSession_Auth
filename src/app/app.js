// Dependencies
var express = require('express'),
    createError = require('http-errors'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    path = require('path');

var middleware = require('./middlewares/app-middlewares');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middelwares
app.use( logger('dev') );
app.use( express.json() );
app.use( express.urlencoded({ extended: false }) );
app.use( cookieParser('secret-key') );
app.use( express.static( path.join(__dirname, 'public') ) );

// Routes
app.use('/', require('./routes/index-routes') );
app.use('/session', require('./routes/session-routes') );
app.use('/cookies', require('./routes/cookie-routes') );

// Error handler
app.use( (req, res, next) => next( createError(404) ) ); // catch 404 and forward to error handler
app.use(middleware.errorHandler); // error handler

module.exports = app;
