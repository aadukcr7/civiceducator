const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

const router = express.Router();

const emailValidation = body('email')
  .trim()
  .isLength({ min: 6, max: 254 })
  .withMessage('Email must be between 6 and 254 characters')
  .isEmail({
    allow_utf8_local_part: false,
    allow_ip_domain: false,
    require_tld: true,
  })
  .withMessage('Invalid email address')
  .normalizeEmail({
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
  });

// Register page (GET)
router.get('/register', isNotAuthenticated, (req, res) => {
  res.render('register', { errors: [], old: {} });
});

// Register (POST)
router.post(
  '/register',
  isNotAuthenticated,
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be 3-20 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    emailValidation,
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .custom((value) => /[A-Z]/.test(value))
      .withMessage('Password must include at least one uppercase letter')
      .custom((value) => /[a-z]/.test(value))
      .withMessage('Password must include at least one lowercase letter')
      .custom((value) => /\d/.test(value))
      .withMessage('Password must include at least one number')
      .custom((value) => /[^A-Za-z0-9]/.test(value))
      .withMessage('Password must include at least one special character')
      .custom((value) => !/\s/.test(value))
      .withMessage('Password must not contain spaces'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
  ],
  async (req, res) => {
    try {
      const limiter = req.app.locals.concurrentUserLimiter;
      if (limiter && limiter.isAtCapacity()) {
        return res.status(503).render('register', {
          errors: [{ msg: 'Maximum active users reached. Please try again shortly.' }],
          old: { username: req.body.username, email: req.body.email },
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('register', {
          errors: errors.array(),
          old: { username: req.body.username, email: req.body.email },
        });
      }

      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.render('register', {
          errors: [{ msg: 'Email already registered' }],
          old: { username, email },
        });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.render('register', {
          errors: [{ msg: 'Username already taken' }],
          old: { username, email },
        });
      }

      // Create new user
      const newUser = await User.create(username, email, password);
      req.session.userId = newUser.id;
      req.session.username = newUser.username;
      req.session.email = newUser.email;
      if (limiter) {
        limiter.registerSession(req.sessionID);
      }

      res.redirect('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      res.render('register', {
        errors: [{ msg: 'Registration failed. Please try again.' }],
        old: { username: req.body.username, email: req.body.email },
      });
    }
  }
);

// Login page (GET)
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', { errors: [], old: {} });
});

// Login (POST)
router.post(
  '/login',
  isNotAuthenticated,
  [
    emailValidation,
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const limiter = req.app.locals.concurrentUserLimiter;
      if (limiter && limiter.isAtCapacity()) {
        return res.status(503).render('login', {
          errors: [{ msg: 'Maximum active users reached. Please try again shortly.' }],
          old: { email: req.body.email },
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('login', { errors: errors.array(), old: { email: req.body.email } });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.render('login', {
          errors: [{ msg: 'Invalid email or password' }],
          old: { email },
        });
      }

      if (user.is_disabled) {
        return res.render('login', {
          errors: [{ msg: 'This account is disabled. Contact support.' }],
          old: { email },
        });
      }

      // Verify password
      const isPasswordValid = await User.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.render('login', {
          errors: [{ msg: 'Invalid email or password' }],
          old: { email },
        });
      }

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.email = user.email;
      if (limiter) {
        limiter.registerSession(req.sessionID);
      }

      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;
      res.redirect(returnTo);
    } catch (err) {
      console.error('Login error:', err);
      res.render('login', {
        errors: [{ msg: 'Login failed. Please try again.' }],
        old: { email: req.body.email },
      });
    }
  }
);

// Logout
router.get('/logout', isAuthenticated, (req, res) => {
  const limiter = req.app.locals.concurrentUserLimiter;
  const currentSessionId = req.sessionID;

  req.session.destroy((err) => {
    if (err) {
      return res.render('404', { error: 'Logout failed' });
    }
    if (limiter) {
      limiter.unregisterSession(currentSessionId);
    }
    res.redirect('/');
  });
});

// Delete account (authenticated user only)
router.post(
  '/delete-account',
  isAuthenticated,
  [
    emailValidation,
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0]?.msg || 'Invalid input';
        return res.redirect(`/profile?deleteError=${encodeURIComponent(firstError)}`);
      }

      const userId = req.session.userId;
      const inputEmail = String(req.body.email || '').trim().toLowerCase();
      const inputPassword = String(req.body.password || '');

      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.redirect('/auth/login');
      }

      if (currentUser.email.toLowerCase() !== inputEmail) {
        return res.redirect('/profile?deleteError=Email%20does%20not%20match%20your%20account');
      }

      const userWithPassword = await User.findByEmail(currentUser.email);
      if (!userWithPassword) {
        return res.redirect('/profile?deleteError=Unable%20to%20validate%20account');
      }

      const isPasswordValid = await User.verifyPassword(inputPassword, userWithPassword.password);
      if (!isPasswordValid) {
        return res.redirect('/profile?deleteError=Incorrect%20password');
      }

      await User.deleteAccount(userId);

      const limiter = req.app.locals.concurrentUserLimiter;
      const currentSessionId = req.sessionID;
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return res.redirect('/auth/login');
        }
        if (limiter) {
          limiter.unregisterSession(currentSessionId);
        }
        res.redirect('/?deleted=1');
      });
    } catch (err) {
      console.error('Delete account error:', err);
      res.redirect('/profile?deleteError=Could%20not%20delete%20account');
    }
  }
);

module.exports = router;
