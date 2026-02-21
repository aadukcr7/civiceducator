const express = require('express');
const { body, validationResult } = require('express-validator');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const adminLevelsService = require('../services/adminLevelsService');
const User = require('../models/User');
const Progress = require('../models/Progress');

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get('/', async (req, res) => {
  try {
    const [levels, userCount, progressStats] = await Promise.all([
      adminLevelsService.getLevels(),
      User.countAll(),
      Progress.getGlobalStats(),
    ]);

    const levelStats = adminLevelsService.getLevelStats(levels);

    res.render('admin/index', {
      stats: {
        users: userCount,
        completedCount: progressStats.completedCount,
        averageScore: progressStats.averageScore,
        ...levelStats,
      },
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).render('404', { error: 'Unable to load admin dashboard' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.listAll();
    res.render('admin/users', { users, flash: null });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).render('404', { error: 'Unable to load users' });
  }
});

router.post('/users/:id/toggle', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const isDisabled = req.body.is_disabled === '1';
    await User.setDisabled(userId, !isDisabled);
    const users = await User.listAll();

    res.render('admin/users', {
      users,
      flash: `User ${!isDisabled ? 'disabled' : 'enabled'} successfully.`,
    });
  } catch (err) {
    console.error('Admin toggle user error:', err);
    res.status(500).render('404', { error: 'Unable to update user status' });
  }
});

router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const tempPassword = User.generateTempPassword();
    await User.updatePassword(userId, tempPassword);
    const users = await User.listAll();

    res.render('admin/users', {
      users,
      flash: `Temporary password for user ${userId}: ${tempPassword}`,
    });
  } catch (err) {
    console.error('Admin reset password error:', err);
    res.status(500).render('404', { error: 'Unable to reset password' });
  }
});

router.get('/levels', async (req, res) => {
  try {
    const levels = await adminLevelsService.getLevels();
    res.render('admin/levels', { levels });
  } catch (err) {
    console.error('Admin levels error:', err);
    res.status(500).render('404', { error: 'Unable to load levels' });
  }
});

router.get('/levels/new', (req, res) => {
  res.render('admin/level-edit', { level: null, errors: [] });
});

router.post(
  '/levels',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('icon').trim().notEmpty().withMessage('Icon is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/level-edit', {
        level: {
          title: req.body.title,
          description: req.body.description,
          icon: req.body.icon,
        },
        errors: errors.array(),
      });
    }

    try {
      await adminLevelsService.createLevel(req.body);

      res.redirect('/admin/levels');
    } catch (err) {
      console.error('Admin create level error:', err);
      res.status(500).render('404', { error: 'Unable to create level' });
    }
  }
);

router.get('/levels/:levelId/edit', async (req, res) => {
  try {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }
    res.render('admin/level-edit', { level, errors: [] });
  } catch (err) {
    console.error('Admin edit level error:', err);
    res.status(500).render('404', { error: 'Unable to load level' });
  }
});

router.post(
  '/levels/:levelId',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('icon').trim().notEmpty().withMessage('Icon is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/level-edit', {
        level: {
          id: req.params.levelId,
          title: req.body.title,
          description: req.body.description,
          icon: req.body.icon,
          lessons: [],
          quiz: [],
        },
        errors: errors.array(),
      });
    }

    try {
      const updated = await adminLevelsService.updateLevel(req.params.levelId, req.body);

      if (!updated) {
        return res.status(404).render('404', { error: 'Level not found' });
      }

      res.redirect('/admin/levels');
    } catch (err) {
      console.error('Admin update level error:', err);
      res.status(500).render('404', { error: 'Unable to update level' });
    }
  }
);

router.post('/levels/:levelId/delete', async (req, res) => {
  try {
    const removed = await adminLevelsService.deleteLevel(req.params.levelId);
    if (!removed) {
      return res.status(404).render('404', { error: 'Level not found' });
    }
    res.redirect('/admin/levels');
  } catch (err) {
    console.error('Admin delete level error:', err);
    res.status(500).render('404', { error: 'Unable to delete level' });
  }
});

router.get('/levels/:levelId/lessons', async (req, res) => {
  try {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }
    res.render('admin/lessons', { level });
  } catch (err) {
    console.error('Admin lessons error:', err);
    res.status(500).render('404', { error: 'Unable to load lessons' });
  }
});

router.get('/levels/:levelId/lessons/new', async (req, res) => {
  const level = await adminLevelsService.getLevel(req.params.levelId);
  if (!level) {
    return res.status(404).render('404', { error: 'Level not found' });
  }
  res.render('admin/lesson-edit', { level, lesson: null, errors: [] });
});

router.post(
  '/levels/:levelId/lessons',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/lesson-edit', {
        level,
        lesson: {
          title: req.body.title,
          content: req.body.content,
          keyPoints: req.body.keyPoints,
          articles: req.body.articles,
          helpline: req.body.helpline,
        },
        errors: errors.array(),
      });
    }

    try {
      await adminLevelsService.createLesson(req.params.levelId, req.body);

      res.redirect(`/admin/levels/${req.params.levelId}/lessons`);
    } catch (err) {
      console.error('Admin create lesson error:', err);
      res.status(500).render('404', { error: 'Unable to create lesson' });
    }
  }
);

router.get('/levels/:levelId/lessons/:lessonId/edit', async (req, res) => {
  try {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const lesson = (level.lessons || []).find(
      (item) => Number(item.id) === Number(req.params.lessonId)
    );

    if (!lesson) {
      return res.status(404).render('404', { error: 'Lesson not found' });
    }

    res.render('admin/lesson-edit', { level, lesson, errors: [] });
  } catch (err) {
    console.error('Admin edit lesson error:', err);
    res.status(500).render('404', { error: 'Unable to load lesson' });
  }
});

router.post(
  '/levels/:levelId/lessons/:lessonId',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/lesson-edit', {
        level,
        lesson: {
          id: req.params.lessonId,
          title: req.body.title,
          content: req.body.content,
          keyPoints: req.body.keyPoints,
          articles: req.body.articles,
          helpline: req.body.helpline,
        },
        errors: errors.array(),
      });
    }

    try {
      const updated = await adminLevelsService.updateLesson(
        req.params.levelId,
        req.params.lessonId,
        req.body
      );

      if (!updated) {
        return res.status(404).render('404', { error: 'Lesson not found' });
      }

      res.redirect(`/admin/levels/${req.params.levelId}/lessons`);
    } catch (err) {
      console.error('Admin update lesson error:', err);
      res.status(500).render('404', { error: 'Unable to update lesson' });
    }
  }
);

router.post('/levels/:levelId/lessons/:lessonId/delete', async (req, res) => {
  try {
    const removed = await adminLevelsService.deleteLesson(req.params.levelId, req.params.lessonId);
    if (!removed) {
      return res.status(404).render('404', { error: 'Lesson not found' });
    }
    res.redirect(`/admin/levels/${req.params.levelId}/lessons`);
  } catch (err) {
    console.error('Admin delete lesson error:', err);
    res.status(500).render('404', { error: 'Unable to delete lesson' });
  }
});

router.get('/levels/:levelId/quiz', async (req, res) => {
  try {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }
    res.render('admin/quiz', { level });
  } catch (err) {
    console.error('Admin quiz error:', err);
    res.status(500).render('404', { error: 'Unable to load quiz' });
  }
});

router.get('/levels/:levelId/quiz/new', async (req, res) => {
  const level = await adminLevelsService.getLevel(req.params.levelId);
  if (!level) {
    return res.status(404).render('404', { error: 'Level not found' });
  }
  res.render('admin/quiz-edit', { level, question: null, errors: [] });
});

router.post(
  '/levels/:levelId/quiz',
  [
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('options').trim().notEmpty().withMessage('Options are required'),
    body('correct').trim().notEmpty().withMessage('Correct index is required'),
  ],
  async (req, res) => {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/quiz-edit', {
        level,
        question: {
          question: req.body.question,
          options: req.body.options,
          correct: req.body.correct,
        },
        errors: errors.array(),
      });
    }

    try {
      await adminLevelsService.createQuizQuestion(req.params.levelId, req.body);

      res.redirect(`/admin/levels/${req.params.levelId}/quiz`);
    } catch (err) {
      console.error('Admin create quiz error:', err);
      res.status(500).render('404', { error: 'Unable to create quiz question' });
    }
  }
);

router.get('/levels/:levelId/quiz/:questionId/edit', async (req, res) => {
  try {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const question = (level.quiz || []).find(
      (item) => Number(item.id) === Number(req.params.questionId)
    );

    if (!question) {
      return res.status(404).render('404', { error: 'Question not found' });
    }

    res.render('admin/quiz-edit', { level, question, errors: [] });
  } catch (err) {
    console.error('Admin edit quiz error:', err);
    res.status(500).render('404', { error: 'Unable to load quiz question' });
  }
});

router.post(
  '/levels/:levelId/quiz/:questionId',
  [
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('options').trim().notEmpty().withMessage('Options are required'),
    body('correct').trim().notEmpty().withMessage('Correct index is required'),
  ],
  async (req, res) => {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/quiz-edit', {
        level,
        question: {
          id: req.params.questionId,
          question: req.body.question,
          options: req.body.options,
          correct: req.body.correct,
        },
        errors: errors.array(),
      });
    }

    try {
      const updated = await adminLevelsService.updateQuizQuestion(
        req.params.levelId,
        req.params.questionId,
        req.body
      );

      if (!updated) {
        return res.status(404).render('404', { error: 'Question not found' });
      }

      res.redirect(`/admin/levels/${req.params.levelId}/quiz`);
    } catch (err) {
      console.error('Admin update quiz error:', err);
      res.status(500).render('404', { error: 'Unable to update quiz question' });
    }
  }
);

router.post('/levels/:levelId/quiz/:questionId/delete', async (req, res) => {
  try {
    const removed = await adminLevelsService.deleteQuizQuestion(
      req.params.levelId,
      req.params.questionId
    );
    if (!removed) {
      return res.status(404).render('404', { error: 'Question not found' });
    }
    res.redirect(`/admin/levels/${req.params.levelId}/quiz`);
  } catch (err) {
    console.error('Admin delete quiz error:', err);
    res.status(500).render('404', { error: 'Unable to delete quiz question' });
  }
});

module.exports = router;
