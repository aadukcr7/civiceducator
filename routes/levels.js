const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const {
  getAllLevels,
  getDashboardData,
  getLevelLessonsPage,
  getLevelQuizPage,
  submitLevelQuiz,
} = require('../controllers/levelsController');

const router = express.Router();

// Apply authentication middleware to all routes in this router
router.use(isAuthenticated);

// Get all levels
router.get('/', getAllLevels);

// Get specific level with lessons
// Dashboard data MUST be defined before dynamic :levelId to avoid route collisions
router.get('/data/dashboard', getDashboardData);

// Get specific level quiz page (direct access allowed)
router.get('/:levelId/quiz', getLevelQuizPage);

// Get specific level lessons page
router.get('/:levelId', getLevelLessonsPage);

// Submit quiz answers
router.post('/:levelId/quiz', submitLevelQuiz);

module.exports = router;
