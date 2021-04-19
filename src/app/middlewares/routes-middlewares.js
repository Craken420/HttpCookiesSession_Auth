const middleware = {};

// WWW-Authenticate
function sendAuth (req, res, next) {
  var err = new Error("You are not authenticated");
  res.setHeader("WWW-Authenticate", "Basic");
  err.status = 401;
  next(err);
}

function getAuth (req, res, next) {
  var authHeader = req.headers.authorization;
  if (!authHeader)
    sendAuth(req, res, next);

  var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");
  return {username: auth[0], password: auth[1]}
}

middleware.basicAuth = function (req, res, next) { // Auth middleware
  authResu = getAuth(req, res, next);
  if (authResu.username == "angelo" && authResu.password == "1234")
    next();
  else
    sendAuth(req, res, next);
}

middleware.authCookie = function (req, res, next) {
  if (!req.signedCookies.user) { // Check sign cookies
    authResu = getAuth(req, res, next);
    if (authResu.username == "cookie" && authResu.password == "1234") {
      res.cookie('user', authResu.username, {signed:true}); // Send user cookies
      next();
    }
    else
      sendAuth(req, res, next);
  }
  else {
    if(req.signedCookies.user == 'cookie') // Using the user cookies
      next();
    else
      sendAuth(req, res, next);
  }
}

middleware.authFixedSession = function (req, res, next) {
  if  (!req.session.user) { // Check user session
    authResu = getAuth(req, res, next);
    if (authResu.username == "session" && authResu.password == "1234") {
      req.session.user = authResu.username    // Send user session
      req.session.password = authResu.password // Send user session
      next();
    }
    else
      sendAuth(req, res, next);
  }
  else {
    if (req.session.user == 'session') // Using the user cookies
      next();
    else
      sendAuth(req, res, next);
  }
}

module.exports = middleware;
