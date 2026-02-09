const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const levelsStore = require('../data/levelsStore');
const Progress = require('../models/Progress');
const User = require('../models/User');

const router = express.Router();

// Apply authentication middleware to all routes in this router
router.use(isAuthenticated);

// Get all levels
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const userProgress = await Progress.getAllProgress(userId);
    const levels = await levelsStore.getLevels();

    // Create a map of completed levels for quick lookup
    const completedMap = {};
    userProgress.forEach((p) => {
      if (p.completed) {
        completedMap[p.level_id] = { score: p.score, completed_at: p.completed_at };
      }
    });

    const levelsWithProgress = levels.map((level) => ({
      ...level,
      completed: !!completedMap[level.id],
      score: completedMap[level.id]?.score || null,
      completedAt: completedMap[level.id]?.completed_at || null,
    }));

    res.render('levels', { levels: levelsWithProgress });
  } catch (err) {
    console.error('Error fetching levels:', err);
    res.render('404', { error: 'Error loading levels' });
  }
});

// Get specific level with lessons
// Dashboard data MUST be defined before dynamic :levelId to avoid route collisions
router.get('/data/dashboard', async (req, res) => {
  try {
    const userId = req.session.userId;
    const levels = await levelsStore.getLevels();

    // Get user info
    const user = await User.findById(userId);

    // Get user's progress
    const allProgress = await Progress.getAllProgress(userId);
    const stats = await Progress.getStats(userId, levels.length);

    // Get completed levels with scores
    const completedLevels = allProgress
      .filter((p) => p.completed)
      .map((p) => {
        const level = levels.find((l) => l.id === p.level_id);
        return {
          id: p.level_id,
          title: level?.title,
          score: p.score,
          completedAt: p.completed_at,
        };
      });

    res.json({
      user: user,
      stats: stats,
      completedLevels: completedLevels,
      allLevels: levels.map((l) => ({
        id: l.id,
        title: l.title,
        icon: l.icon,
        description: l.description,
      })),
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Error loading dashboard data' });
  }
});

// Get specific level with lessons
router.get('/:levelId', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId);
    const userId = req.session.userId;

    const levels = await levelsStore.getLevels();
    const level = levels.find((l) => l.id === levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    // Get user's progress for this level
    const progress = await Progress.getProgress(userId, levelId);

    res.render('level', {
      level: level,
      progress: progress || { completed: false, score: null },
      lessons: level.lessons || [],
    });
  } catch (err) {
    console.error('Error fetching level:', err);
    res.render('404', { error: 'Error loading level' });
  }
});

// Submit quiz answers
router.post('/:levelId/quiz', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId);
    const userId = req.session.userId;
    const answers = req.body.answers;

    const levels = await levelsStore.getLevels();
    const level = levels.find((l) => l.id === levelId);
    if (!level || !level.quiz) {
      return res.status(404).render('404', { error: 'Level or quiz not found' });
    }

    // Calculate score
    let correctCount = 0;
    const questionResults = level.quiz.map((question) => {
      const userAnswerIndex = parseInt(answers[`q${question.id}`]);
      const isCorrect = userAnswerIndex === question.correct;
      if (isCorrect) correctCount++;

      return {
        id: question.id,
        question: question.question,
        userAnswer: userAnswerIndex,
        correctAnswer: question.correct,
        isCorrect: isCorrect,
        options: question.options,
      };
    });

    const totalQuestions = level.quiz.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70;

    // Save progress
    await Progress.saveProgress(userId, levelId, score, passed);

    res.render('result', {
      levelId: levelId,
      levelTitle: level.title,
      score: score,
      passed: passed,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      questionResults: questionResults,
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.render('404', { error: 'Error processing quiz submission' });
  }
});

module.exports = router;
