const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const levelsStore = require('../data/levelsStore');
const Progress = require('../models/Progress');
const User = require('../models/User');

const router = express.Router();
const QUIZ_LEAD_SIZE = 3;
const QUIZ_MAX_GENERATION_ATTEMPTS = 10;
const QUIZ_RECENT_LEADS_LIMIT = 5;

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getLeadSignature(questions) {
  return questions
    .slice(0, Math.min(QUIZ_LEAD_SIZE, questions.length))
    .map((question) => question.id)
    .join(',');
}

function buildQuizForAttempt(req, levelId, baseQuiz) {
  if (!Array.isArray(baseQuiz) || baseQuiz.length <= 1) {
    return Array.isArray(baseQuiz) ? [...baseQuiz] : [];
  }

  const levelKey = String(levelId);
  const recentLeadsByLevel = req.session.quizRecentLeads || {};
  const lastOrderByLevel = req.session.quizLastOrder || {};
  const recentLeads = Array.isArray(recentLeadsByLevel[levelKey])
    ? recentLeadsByLevel[levelKey]
    : [];
  const previousOrder = Array.isArray(lastOrderByLevel[levelKey]) ? lastOrderByLevel[levelKey] : [];
  const previousOrderSignature = previousOrder.join(',');

  let candidate = shuffleArray(baseQuiz);

  for (let attempt = 0; attempt < QUIZ_MAX_GENERATION_ATTEMPTS; attempt++) {
    const leadSignature = getLeadSignature(candidate);
    const candidateOrderSignature = candidate.map((q) => q.id).join(',');
    const repeatsLead = recentLeads.includes(leadSignature);
    const repeatsFullOrder = previousOrderSignature && candidateOrderSignature === previousOrderSignature;

    if (!repeatsLead && !repeatsFullOrder) {
      break;
    }

    candidate = shuffleArray(baseQuiz);
  }

  return candidate;
}

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
    const randomizedQuiz = buildQuizForAttempt(req, levelId, level.quiz || []);
    const levelKey = String(levelId);

    if (!req.session.quizAttemptOrder) {
      req.session.quizAttemptOrder = {};
    }
    req.session.quizAttemptOrder[levelKey] = randomizedQuiz.map((question) => question.id);

    res.render('level', {
      level: {
        ...level,
        quiz: randomizedQuiz,
      },
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
    const levelKey = String(levelId);

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

    const attemptOrderByLevel = req.session.quizAttemptOrder || {};
    const lastOrderByLevel = req.session.quizLastOrder || {};
    const recentLeadsByLevel = req.session.quizRecentLeads || {};
    const attemptOrder = Array.isArray(attemptOrderByLevel[levelKey])
      ? attemptOrderByLevel[levelKey]
      : level.quiz.map((question) => question.id);
    const leadSignature = attemptOrder.slice(0, Math.min(QUIZ_LEAD_SIZE, attemptOrder.length)).join(',');

    lastOrderByLevel[levelKey] = attemptOrder;
    recentLeadsByLevel[levelKey] = [
      ...(Array.isArray(recentLeadsByLevel[levelKey]) ? recentLeadsByLevel[levelKey] : []),
      leadSignature,
    ].slice(-QUIZ_RECENT_LEADS_LIMIT);

    req.session.quizLastOrder = lastOrderByLevel;
    req.session.quizRecentLeads = recentLeadsByLevel;
    req.session.quizAttemptOrder = attemptOrderByLevel;
    delete req.session.quizAttemptOrder[levelKey];

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
