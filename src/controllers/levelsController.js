const levelsStore = require('../data/levelsStore');
const Progress = require('../models/Progress');
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
const { buildDashboardAnalytics } = require('../services/levelsAnalyticsService');

const QUIZ_RECENT_LEADS_LIMIT = 5;

function parseLevelId(value) {
  const levelId = Number.parseInt(value, 10);
  return Number.isFinite(levelId) ? levelId : null;
}

function getLevelById(levels, levelId) {
  return levels.find((level) => level.id === levelId) || null;
}

function ensureQuizAttemptSessionState(req) {
  if (!req.session.quizAttemptOrder) {
    req.session.quizAttemptOrder = {};
  }
  if (!req.session.quizAttemptQuestions) {
    req.session.quizAttemptQuestions = {};
  }
  if (!req.session.quizAttemptMeta) {
    req.session.quizAttemptMeta = {};
  }
}

async function getAllLevels(req, res) {
  try {
    const userId = req.session.userId;
    const userProgress = await Progress.getAllProgress(userId);
    const levels = await levelsStore.getLevels();

    const completedMap = {};
    userProgress.forEach((progress) => {
      if (progress.completed) {
        completedMap[progress.level_id] = {
          score: progress.score,
          completed_at: progress.completed_at,
        };
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

    return res.render('levels', { levels: levelsWithProgress });
  } catch (err) {
    console.error('Error fetching levels:', err);
    return res.render('404', { error: 'Error loading levels' });
  }
}

async function getDashboardData(req, res) {
  try {
    const userId = req.session.userId;
    const levels = await levelsStore.getLevels();

    const allProgress = await Progress.getAllProgress(userId);
    const stats = await Progress.getStats(userId, levels.length);
    const attempts = await Progress.getRecentQuizAttempts(userId, 100);
    const analytics = buildDashboardAnalytics(levels, allProgress, attempts);

    return res.json({
      stats,
      analytics,
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    return res.status(500).json({ error: 'Error loading dashboard data' });
  }
}

async function getLevelQuizPage(req, res) {
  try {
    const levelId = parseLevelId(req.params.levelId);
    if (levelId === null) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const userId = req.session.userId;
    const levels = await levelsStore.getLevels();
    const level = getLevelById(levels, levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

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

    ensureQuizAttemptSessionState(req);
    req.session.quizAttemptOrder[levelKey] = randomizedQuiz.map((question) => question.id);
    req.session.quizAttemptQuestions[levelKey] = randomizedQuiz;
    req.session.quizAttemptMeta[levelKey] = {
      startedAt: Date.now(),
      difficulty: adaptiveDifficulty,
      totalQuestions: randomizedQuiz.length,
    };

    return res.render('level-quiz', {
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
    return res.render('404', { error: 'Error loading level' });
  }
}

async function getLevelLessonsPage(req, res) {
  try {
    const levelId = parseLevelId(req.params.levelId);
    if (levelId === null) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const userId = req.session.userId;
    const levels = await levelsStore.getLevels();
    const level = getLevelById(levels, levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const progress = await Progress.getProgress(userId, levelId);
    const quizPool = buildQuizPoolForLevel(level);
    const quizQuestionsPerAttempt = getAdaptiveQuestionTarget(quizPool.length);

    return res.render('level', {
      level,
      progress: progress || { completed: false, score: null },
      lessons: level.lessons || [],
      quizQuestionsPerAttempt,
      quizPoolCount: quizPool.length,
    });
  } catch (err) {
    console.error('Error fetching level lessons:', err);
    return res.render('404', { error: 'Error loading level lessons' });
  }
}

async function submitLevelQuiz(req, res) {
  try {
    const levelId = parseLevelId(req.params.levelId);
    if (levelId === null) {
      return res.status(404).render('404', { error: 'Level or quiz not found' });
    }

    const userId = req.session.userId;
    const answers = req.body.answers || {};
    const levelKey = String(levelId);

    const levels = await levelsStore.getLevels();
    const level = getLevelById(levels, levelId);
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

    let correctCount = 0;
    const questionResults = quizQuestions.map((question) => {
      const userAnswerIndex = Number.parseInt(answers[`q${question.id}`], 10);
      const isCorrect = userAnswerIndex === question.correct;
      if (isCorrect) {
        correctCount++;
      }

      return {
        id: question.id,
        question: question.question,
        userAnswer: userAnswerIndex,
        correctAnswer: question.correct,
        isCorrect,
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
    const effectiveOrder =
      attemptOrder.length > 0 ? attemptOrder : quizPool.map((question) => question.id);
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

    return res.render('result', {
      levelId,
      levelTitle: level.title,
      score,
      passed,
      correctCount,
      totalQuestions,
      questionResults,
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    return res.render('404', { error: 'Error processing quiz submission' });
  }
}

module.exports = {
  getAllLevels,
  getDashboardData,
  getLevelLessonsPage,
  getLevelQuizPage,
  submitLevelQuiz,
};
