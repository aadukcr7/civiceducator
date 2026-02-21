const { body } = require('express-validator');

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

const registerValidation = [
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
];

const loginValidation = [
  emailValidation,
  body('password').notEmpty().withMessage('Password is required'),
];

const credentialValidation = [
  emailValidation,
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  credentialValidation,
  loginValidation,
  registerValidation,
};
