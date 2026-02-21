const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const levelsStore = require('../data/levelsStore');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { buildDashboardAnalytics } = require('../services/levelsAnalyticsService');
const {
  QUIZ_LEAD_SIZE,
  QUIZ_RECENT_ATTEMPTS_FOR_ADAPTIVE,
  buildQuizPoolForLevel,
  buildQuizForAttempt,
  getAdaptiveQuestionTarget,
  getDifficultyLabel,
  getRecommendedDifficultyFromAttempts,
  normalizeDifficulty,
} = require('../services/levelsQuizService');

const router = express.Router();
const QUIZ_RECENT_LEADS_LIMIT = 5;

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

    const levelsWithProgress = levels.map((level) => {
      const quizPool = buildQuizPoolForLevel(level);
      const quizQuestionsPerAttempt = getAdaptiveQuestionTarget(quizPool.length);

      return {
        ...level,
        completed: !!completedMap[level.id],
        score: completedMap[level.id]?.score || null,
        completedAt: completedMap[level.id]?.completed_at || null,
        quizPoolCount: quizPool.length,
        quizQuestionsPerAttempt,
      };
    });

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
    const attempts = await Progress.getRecentQuizAttempts(userId, 100);

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

    const analytics = buildDashboardAnalytics(levels, allProgress, attempts);

    res.json({
      user: user,
      stats: stats,
      completedLevels: completedLevels,
      analytics,
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

// Get specific level quiz page (direct access allowed)
router.get('/:levelId/quiz', async (req, res) => {
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
    const recentAttempts = await Progress.getRecentQuizAttemptsForLevel(
      userId,
      levelId,
      QUIZ_RECENT_ATTEMPTS_FOR_ADAPTIVE
    );
    const adaptiveDifficulty = getRecommendedDifficultyFromAttempts(recentAttempts);
    const quizPool = buildQuizPoolForLevel(level);
    const randomizedQuiz = buildQuizForAttempt(req, levelId, quizPool);
    const levelKey = String(levelId);

    if (!req.session.quizAttemptOrder) {
      req.session.quizAttemptOrder = {};
    }
    if (!req.session.quizAttemptQuestions) {
      req.session.quizAttemptQuestions = {};
    }
    if (!req.session.quizAttemptMeta) {
      req.session.quizAttemptMeta = {};
    }
    req.session.quizAttemptOrder[levelKey] = randomizedQuiz.map((question) => question.id);
    req.session.quizAttemptQuestions[levelKey] = randomizedQuiz;
    req.session.quizAttemptMeta[levelKey] = {
      startedAt: Date.now(),
      difficulty: adaptiveDifficulty,
      totalQuestions: randomizedQuiz.length,
    };

    res.render('level-quiz', {
      level: {
        ...level,
        quiz: randomizedQuiz,
      },
      quizQuestionsPerAttempt: randomizedQuiz.length,
      quizPoolCount: quizPool.length,
      adaptiveDifficulty: getDifficultyLabel(adaptiveDifficulty),
      progress: progress || { completed: false, score: null },
      lessons: level.lessons || [],
    });
  } catch (err) {
    console.error('Error fetching level:', err);
    res.render('404', { error: 'Error loading level' });
  }
});

// Get specific level lessons page
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
    const quizPool = buildQuizPoolForLevel(level);
    const quizQuestionsPerAttempt = getAdaptiveQuestionTarget(quizPool.length);

    res.render('level', {
      level,
      progress: progress || { completed: false, score: null },
      lessons: level.lessons || [],
      quizQuestionsPerAttempt,
      quizPoolCount: quizPool.length,
    });
  } catch (err) {
    console.error('Error fetching level lessons:', err);
    res.render('404', { error: 'Error loading level lessons' });
  }
});

// Submit quiz answers
router.post('/:levelId/quiz', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId);
    const userId = req.session.userId;
    const answers = req.body.answers || {};
    const levelKey = String(levelId);

    const levels = await levelsStore.getLevels();
    const level = levels.find((l) => l.id === levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level or quiz not found' });
    }

    const attemptOrderByLevel = req.session.quizAttemptOrder || {};
    const attemptQuestionsByLevel = req.session.quizAttemptQuestions || {};
    const attemptMetaByLevel = req.session.quizAttemptMeta || {};
    const attemptOrder = Array.isArray(attemptOrderByLevel[levelKey])
      ? attemptOrderByLevel[levelKey]
      : [];
    const quizPool = Array.isArray(attemptQuestionsByLevel[levelKey])
      ? attemptQuestionsByLevel[levelKey]
      : buildQuizPoolForLevel(level);
    if (!Array.isArray(quizPool) || quizPool.length === 0) {
      return res.status(404).render('404', { error: 'Level or quiz not found' });
    }

    const questionById = quizPool.reduce((acc, question) => {
      acc[question.id] = question;
      return acc;
    }, {});
    const presentedQuestions = attemptOrder
      .map((questionId) => questionById[questionId])
      .filter((question) => !!question);
    const quizQuestions = presentedQuestions.length > 0 ? presentedQuestions : quizPool;

    // Calculate score
    let correctCount = 0;
    const questionResults = quizQuestions.map((question) => {
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

    const totalQuestions = quizQuestions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70;
    const attemptMeta = attemptMetaByLevel[levelKey] || {};
    const startedAt = Number(attemptMeta.startedAt) || Date.now();
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const attemptDifficulty = normalizeDifficulty(attemptMeta.difficulty);

    // Save progress
    await Progress.saveProgress(userId, levelId, score, passed);
    await Progress.saveQuizAttempt({
      userId,
      levelId,
      score,
      correctCount,
      totalQuestions,
      durationSeconds,
      difficulty: attemptDifficulty,
    });

    const lastOrderByLevel = req.session.quizLastOrder || {};
    const recentLeadsByLevel = req.session.quizRecentLeads || {};
    const effectiveOrder = attemptOrder.length > 0 ? attemptOrder : quizPool.map((question) => question.id);
    const leadSignature = effectiveOrder
      .slice(0, Math.min(QUIZ_LEAD_SIZE, effectiveOrder.length))
      .join(',');

    lastOrderByLevel[levelKey] = effectiveOrder;
    recentLeadsByLevel[levelKey] = [
      ...(Array.isArray(recentLeadsByLevel[levelKey]) ? recentLeadsByLevel[levelKey] : []),
      leadSignature,
    ].slice(-QUIZ_RECENT_LEADS_LIMIT);

    req.session.quizLastOrder = lastOrderByLevel;
    req.session.quizRecentLeads = recentLeadsByLevel;
    req.session.quizAttemptOrder = attemptOrderByLevel;
    req.session.quizAttemptQuestions = attemptQuestionsByLevel;
    req.session.quizAttemptMeta = attemptMetaByLevel;
    delete req.session.quizAttemptOrder[levelKey];
    delete req.session.quizAttemptQuestions[levelKey];
    delete req.session.quizAttemptMeta[levelKey];

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
