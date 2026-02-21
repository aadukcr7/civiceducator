const express = require('express');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');
const {
  deleteAccount,
  login,
  loginPage,
  logout,
  register,
  registerPage,
  resetLearningData,
} = require('../controllers/authController');
const {
  credentialValidation,
  loginValidation,
  registerValidation,
} = require('../validators/authValidators');

const router = express.Router();

// Register page (GET)
router.get('/register', isNotAuthenticated, registerPage);

// Register (POST)
router.post('/register', isNotAuthenticated, registerValidation, register);

// Login page (GET)
router.get('/login', isNotAuthenticated, loginPage);

// Login (POST)
router.post('/login', isNotAuthenticated, loginValidation, login);

// Logout
router.get('/logout', isAuthenticated, logout);

// Delete account (authenticated user only)
router.post('/delete-account', isAuthenticated, credentialValidation, deleteAccount);

// Reset learning data (authenticated user only)
router.post('/reset-learning-data', isAuthenticated, credentialValidation, resetLearningData);

module.exports = router;
