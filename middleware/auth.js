// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
}

// Middleware to check if user is already logged in (for login/register pages)
function isNotAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
};
