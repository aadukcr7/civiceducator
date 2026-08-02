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

function isAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return res.status(403).render('403');
  }

  const sessionEmail = req.session?.email;
  if (sessionEmail && sessionEmail.toLowerCase() === adminEmail.toLowerCase()) {
    return next();
  }

  return res.status(403).render('403');
}

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
  isAdmin,
};
