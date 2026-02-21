const { validationResult } = require('express-validator');
const User = require('../models/User');
const Progress = require('../models/Progress');
const {
  destroySession,
  getConcurrentLimiter,
  mapCredentialErrorToMessage,
  setAuthenticatedSession,
  validateCurrentUserCredentials,
} = require('../services/authAccountService');

function getValidationErrors(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array();
}

function renderRegister(res, errors = [], old = {}) {
  return res.render('register', { errors, old });
}

function renderLogin(res, errors = [], old = {}) {
  return res.render('login', { errors, old });
}

function registerPage(req, res) {
  return renderRegister(res);
}

async function register(req, res) {
  try {
    const limiter = getConcurrentLimiter(req);
    if (limiter && limiter.isAtCapacity()) {
      return renderRegister(
        res,
        [{ msg: 'Maximum active users reached. Please try again shortly.' }],
        { username: req.body.username, email: req.body.email }
      );
    }

    const errors = getValidationErrors(req);
    if (errors) {
      return renderRegister(res, errors, {
        username: req.body.username,
        email: req.body.email,
      });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return renderRegister(res, [{ msg: 'Email already registered' }], { username, email });
    }

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return renderRegister(res, [{ msg: 'Username already taken' }], { username, email });
    }

    const newUser = await User.create(username, email, password);
    setAuthenticatedSession(req, newUser);

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    return renderRegister(
      res,
      [{ msg: 'Registration failed. Please try again.' }],
      { username: req.body.username, email: req.body.email }
    );
  }
}

function loginPage(req, res) {
  return renderLogin(res);
}

async function login(req, res) {
  try {
    const limiter = getConcurrentLimiter(req);
    if (limiter && limiter.isAtCapacity()) {
      return renderLogin(
        res,
        [{ msg: 'Maximum active users reached. Please try again shortly.' }],
        { email: req.body.email }
      );
    }

    const errors = getValidationErrors(req);
    if (errors) {
      return renderLogin(res, errors, { email: req.body.email });
    }

    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return renderLogin(res, [{ msg: 'Invalid email or password' }], { email });
    }

    if (user.is_disabled) {
      return renderLogin(res, [{ msg: 'This account is disabled. Contact support.' }], { email });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return renderLogin(res, [{ msg: 'Invalid email or password' }], { email });
    }

    setAuthenticatedSession(req, user);

    const returnTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    return res.redirect(returnTo);
  } catch (err) {
    console.error('Login error:', err);
    return renderLogin(res, [{ msg: 'Login failed. Please try again.' }], { email: req.body.email });
  }
}

async function logout(req, res) {
  try {
    await destroySession(req);
    return res.redirect('/');
  } catch (err) {
    return res.render('404', { error: 'Logout failed' });
  }
}

async function deleteAccount(req, res) {
  try {
    const errors = getValidationErrors(req);
    if (errors) {
      const firstError = errors[0]?.msg || 'Invalid input';
      return res.redirect(`/profile?deleteError=${encodeURIComponent(firstError)}`);
    }

    const userId = req.session.userId;
    const inputEmail = String(req.body.email || '').trim().toLowerCase();
    const inputPassword = String(req.body.password || '');

    const validation = await validateCurrentUserCredentials(userId, inputEmail, inputPassword);
    if (!validation.ok && validation.code === 'USER_NOT_FOUND') {
      return res.redirect('/auth/login');
    }
    if (!validation.ok) {
      return res.redirect(`/profile?${mapCredentialErrorToMessage(validation.code, 'delete')}`);
    }

    await User.deleteAccount(userId);
    await destroySession(req);

    return res.redirect('/?deleted=1');
  } catch (err) {
    console.error('Delete account error:', err);
    return res.redirect('/profile?deleteError=Could%20not%20delete%20account');
  }
}

async function resetLearningData(req, res) {
  try {
    const errors = getValidationErrors(req);
    if (errors) {
      const firstError = errors[0]?.msg || 'Invalid input';
      return res.redirect(`/profile?resetError=${encodeURIComponent(firstError)}`);
    }

    const userId = req.session.userId;
    const inputEmail = String(req.body.email || '').trim().toLowerCase();
    const inputPassword = String(req.body.password || '');

    const validation = await validateCurrentUserCredentials(userId, inputEmail, inputPassword);
    if (!validation.ok && validation.code === 'USER_NOT_FOUND') {
      return res.redirect('/auth/login');
    }
    if (!validation.ok) {
      return res.redirect(`/profile?${mapCredentialErrorToMessage(validation.code, 'reset')}`);
    }

    await Progress.resetLearningData(userId);
    return res.redirect('/profile?resetSuccess=1');
  } catch (err) {
    console.error('Reset learning data error:', err);
    return res.redirect('/profile?resetError=Could%20not%20reset%20learning%20data');
  }
}

module.exports = {
  deleteAccount,
  login,
  loginPage,
  logout,
  register,
  registerPage,
  resetLearningData,
};
