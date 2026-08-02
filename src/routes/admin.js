const express = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const {
  levelValidation,
  lessonValidation,
  quizValidation,
} = require('../validators/adminValidators');
const {
  createLesson,
  createLevel,
  createQuizQuestion,
  dashboard,
  deleteLesson,
  deleteLevel,
  deleteQuizQuestion,
  editLessonPage,
  editLevelPage,
  editQuizQuestionPage,
  lessonsPage,
  levelsPage,
  newLessonPage,
  newLevelPage,
  newQuizPage,
  quizPage,
  resetUserPassword,
  toggleUser,
  updateLesson,
  updateLevel,
  updateQuizQuestion,
  usersPage,
} = require('../controllers/adminController');

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get('/', dashboard);
router.get('/users', usersPage);
router.post('/users/:id/toggle', toggleUser);
router.post('/users/:id/reset-password', resetUserPassword);

router.get('/levels', levelsPage);
router.get('/levels/new', newLevelPage);
router.post('/levels', levelValidation, createLevel);
router.get('/levels/:levelId/edit', editLevelPage);
router.post('/levels/:levelId', levelValidation, updateLevel);
router.post('/levels/:levelId/delete', deleteLevel);

router.get('/levels/:levelId/lessons', lessonsPage);
router.get('/levels/:levelId/lessons/new', newLessonPage);
router.post('/levels/:levelId/lessons', lessonValidation, createLesson);
router.get('/levels/:levelId/lessons/:lessonId/edit', editLessonPage);
router.post('/levels/:levelId/lessons/:lessonId', lessonValidation, updateLesson);
router.post('/levels/:levelId/lessons/:lessonId/delete', deleteLesson);

router.get('/levels/:levelId/quiz', quizPage);
router.get('/levels/:levelId/quiz/new', newQuizPage);
router.post('/levels/:levelId/quiz', quizValidation, createQuizQuestion);
router.get('/levels/:levelId/quiz/:questionId/edit', editQuizQuestionPage);
router.post('/levels/:levelId/quiz/:questionId', quizValidation, updateQuizQuestion);
router.post('/levels/:levelId/quiz/:questionId/delete', deleteQuizQuestion);

module.exports = router;
