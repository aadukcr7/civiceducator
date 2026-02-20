const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const levelsStore = require('../data/levelsStore');
const Progress = require('../models/Progress');
const User = require('../models/User');

const router = express.Router();
const QUIZ_LEAD_SIZE = 3;
const QUIZ_MAX_GENERATION_ATTEMPTS = 10;
const QUIZ_RECENT_LEADS_LIMIT = 5;
const QUIZ_RECENT_ATTEMPTS_FOR_ADAPTIVE = 3;
const QUIZ_QUESTIONS_PER_ATTEMPT = 15;
const FAST_SECONDS_PER_QUESTION = 22;
const SLOW_SECONDS_PER_QUESTION = 40;

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

function normalizeDifficulty(value) {
  if (value === 'easy' || value === 'hard') {
    return value;
  }
  return 'medium';
}

function getQuestionDifficultyBuckets(baseQuiz) {
  if (!Array.isArray(baseQuiz) || baseQuiz.length === 0) {
    return { easy: [], medium: [], hard: [] };
  }

  const sorted = [...baseQuiz].sort((a, b) => Number(a.id) - Number(b.id));
  const total = sorted.length;
  const easyEnd = Math.ceil(total * 0.34);
  const mediumEnd = Math.ceil(total * 0.67);

  return {
    easy: sorted.slice(0, easyEnd),
    medium: sorted.slice(easyEnd, mediumEnd),
    hard: sorted.slice(mediumEnd),
  };
}

function getAdaptiveQuestionTarget(totalQuestions) {
  if (totalQuestions <= QUIZ_QUESTIONS_PER_ATTEMPT) {
    return totalQuestions;
  }

  return QUIZ_QUESTIONS_PER_ATTEMPT;
}

function buildLessonDerivedQuizQuestions(level) {
  const lessons = Array.isArray(level?.lessons) ? level.lessons : [];
  if (lessons.length < 4) {
    return [];
  }

  return lessons.map((lesson) => {
    const correctTitle = lesson.title;
    const distractors = shuffleArray(
      lessons
        .filter((item) => item.id !== lesson.id)
        .map((item) => item.title)
    ).slice(0, 3);

    const options = shuffleArray([correctTitle, ...distractors]);
    const clue = Array.isArray(lesson.keyPoints) && lesson.keyPoints.length > 0
      ? lesson.keyPoints[0]
      : 'core topic of this lesson';

    return {
      id: Number(`9${lesson.id}`),
      question: `Which lesson topic best matches this focus: "${clue}"?`,
      options,
      correct: options.indexOf(correctTitle),
    };
  });
}

function buildQuizPoolForLevel(level) {
  const baseQuiz = Array.isArray(level?.quiz) ? level.quiz : [];
  const lessonDerived = buildLessonDerivedQuizQuestions(level);
  const source = lessonDerived.length >= QUIZ_QUESTIONS_PER_ATTEMPT
    ? lessonDerived
    : [...lessonDerived, ...baseQuiz];
  const seenIds = new Set();

  return source.filter((question) => {
    const id = Number(question?.id);
    if (!Number.isFinite(id) || seenIds.has(id)) {
      return false;
    }
    seenIds.add(id);
    return Array.isArray(question.options) && question.options.length >= 2;
  });
}

function buildAdaptiveQuestionSet(baseQuiz, targetDifficulty) {
  if (!Array.isArray(baseQuiz) || baseQuiz.length <= 1) {
    return Array.isArray(baseQuiz) ? [...baseQuiz] : [];
  }

  const normalizedDifficulty = normalizeDifficulty(targetDifficulty);
  const buckets = getQuestionDifficultyBuckets(baseQuiz);
  const targetCount = getAdaptiveQuestionTarget(baseQuiz.length);

  if (targetCount >= baseQuiz.length) {
    return shuffleArray(baseQuiz);
  }

  let desired = { easy: 2, medium: 2, hard: targetCount - 4 };
  if (normalizedDifficulty === 'easy') {
    desired = {
      easy: Math.ceil(targetCount * 0.5),
      medium: Math.ceil(targetCount * 0.35),
      hard: targetCount - Math.ceil(targetCount * 0.5) - Math.ceil(targetCount * 0.35),
    };
  }
  if (normalizedDifficulty === 'medium') {
    desired = {
      easy: Math.ceil(targetCount * 0.3),
      medium: Math.ceil(targetCount * 0.45),
      hard: targetCount - Math.ceil(targetCount * 0.3) - Math.ceil(targetCount * 0.45),
    };
  }

  const difficultyPriority =
    normalizedDifficulty === 'easy' ? ['easy', 'medium', 'hard'] : normalizedDifficulty === 'hard' ? ['hard', 'medium', 'easy'] : ['medium', 'easy', 'hard'];

  const pools = {
    easy: shuffleArray(buckets.easy),
    medium: shuffleArray(buckets.medium),
    hard: shuffleArray(buckets.hard),
  };
  const selected = [];

  function takeFromPool(name, count) {
    const pool = pools[name] || [];
    const actual = Math.max(0, Math.min(count, pool.length));
    for (let i = 0; i < actual; i++) {
      selected.push(pool.pop());
    }
  }

  takeFromPool('easy', desired.easy);
  takeFromPool('medium', desired.medium);
  takeFromPool('hard', desired.hard);

  while (selected.length < targetCount) {
    let added = false;
    for (const key of difficultyPriority) {
      if (pools[key].length > 0) {
        selected.push(pools[key].pop());
        added = true;
        break;
      }
    }
    if (!added) {
      break;
    }
  }

  return shuffleArray(selected);
}

function getAverageSecondsPerQuestion(attempts) {
  if (!Array.isArray(attempts) || attempts.length === 0) {
    return null;
  }

  const values = attempts
    .map((attempt) => {
      const totalQuestions = Number(attempt.total_questions) || 0;
      const durationSeconds = Number(attempt.duration_seconds) || 0;
      if (totalQuestions <= 0 || durationSeconds <= 0) {
        return null;
      }
      return durationSeconds / totalQuestions;
    })
    .filter((v) => v !== null);

  if (!values.length) {
    return null;
  }

  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getRecommendedDifficultyFromAttempts(attempts) {
  if (!Array.isArray(attempts) || attempts.length === 0) {
    return 'medium';
  }

  const avgScore = Math.round(
    attempts.reduce((sum, attempt) => sum + (Number(attempt.score) || 0), 0) / attempts.length
  );
  const avgSecondsPerQuestion = getAverageSecondsPerQuestion(attempts);
  const recentTwo = attempts.slice(0, 2);
  const recentTwoAvg = recentTwo.length
    ? recentTwo.reduce((sum, attempt) => sum + (Number(attempt.score) || 0), 0) / recentTwo.length
    : avgScore;

  if (recentTwo.length === 2 && recentTwoAvg >= 88 && (avgSecondsPerQuestion || 0) <= FAST_SECONDS_PER_QUESTION) {
    return 'hard';
  }

  if (avgScore >= 82 && (avgSecondsPerQuestion || 0) <= FAST_SECONDS_PER_QUESTION) {
    return 'hard';
  }

  if (avgScore < 60 || (avgSecondsPerQuestion && avgSecondsPerQuestion >= SLOW_SECONDS_PER_QUESTION)) {
    return 'easy';
  }

  return 'medium';
}

function getDifficultyLabel(difficulty) {
  const normalized = normalizeDifficulty(difficulty);
  if (normalized === 'easy') {
    return 'Easy';
  }
  if (normalized === 'hard') {
    return 'Hard';
  }
  return 'Medium';
}

function buildDashboardAnalytics(levels, allProgress, attempts) {
  const attemptsByLevel = attempts.reduce((acc, attempt) => {
    const key = Number(attempt.level_id);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(attempt);
    return acc;
  }, {});

  const progressByLevel = allProgress.reduce((acc, item) => {
    acc[Number(item.level_id)] = item;
    return acc;
  }, {});

  const topicStats = levels.map((level) => {
    const levelAttempts = attemptsByLevel[level.id] || [];
    const avgScore = levelAttempts.length
      ? Math.round(levelAttempts.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / levelAttempts.length)
      : null;
    const avgSecondsPerQuestion = levelAttempts.length
      ? getAverageSecondsPerQuestion(levelAttempts)
      : null;
    const nextDifficulty = getRecommendedDifficultyFromAttempts(levelAttempts.slice(0, QUIZ_RECENT_ATTEMPTS_FOR_ADAPTIVE));
    const progress = progressByLevel[level.id];

    return {
      levelId: level.id,
      topic: level.title,
      attempts: levelAttempts.length,
      avgScore,
      avgSecondsPerQuestion:
        avgSecondsPerQuestion !== null ? Number(avgSecondsPerQuestion.toFixed(1)) : null,
      completed: !!progress?.completed,
      nextDifficulty,
      nextDifficultyLabel: getDifficultyLabel(nextDifficulty),
      lessonCount: Array.isArray(level.lessons) ? level.lessons.length : 0,
    };
  });

  const ranked = topicStats
    .filter((item) => item.attempts > 0 && item.avgScore !== null)
    .map((item) => ({
      ...item,
      rating:
        item.avgScore -
        Math.max(0, ((item.avgSecondsPerQuestion || FAST_SECONDS_PER_QUESTION) - 30) * 0.6),
    }));

  const strengths = [...ranked]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
    .map((item) => ({
      levelId: item.levelId,
      topic: item.topic,
      avgScore: item.avgScore,
      avgSecondsPerQuestion: item.avgSecondsPerQuestion,
    }));

  const weakAreas = [...ranked]
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 3)
    .map((item) => ({
      levelId: item.levelId,
      topic: item.topic,
      avgScore: item.avgScore,
      avgSecondsPerQuestion: item.avgSecondsPerQuestion,
    }));

  const primaryWeak = weakAreas[0];
  let recommendedLevel = null;
  let reason = '';

  if (primaryWeak) {
    recommendedLevel = levels.find((level) => level.id === primaryWeak.levelId) || null;
    reason = 'Focus on your weakest topic based on recent quiz accuracy and speed.';
  }

  if (!recommendedLevel) {
    recommendedLevel = levels.find((level) => !progressByLevel[level.id]?.completed) || levels[0] || null;
    reason = 'Continue your learning path with the next available level.';
  }

  let recommendedNextLesson = null;
  if (recommendedLevel) {
    const lessons = Array.isArray(recommendedLevel.lessons) ? recommendedLevel.lessons : [];
    if (lessons.length > 0) {
      const lessonIndex = primaryWeak && primaryWeak.avgScore !== null && primaryWeak.avgScore < 60
        ? 0
        : Math.min(lessons.length - 1, Math.floor(lessons.length / 2));

      recommendedNextLesson = {
        levelId: recommendedLevel.id,
        levelTitle: recommendedLevel.title,
        lessonId: lessons[lessonIndex].id,
        lessonTitle: lessons[lessonIndex].title,
        reason,
      };
    }
  }

  return {
    topicStats,
    strengths,
    weakAreas,
    recommendedNextLesson,
  };
}

function buildQuizForAttempt(req, levelId, baseQuiz, targetDifficulty) {
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

  const targetCount = getAdaptiveQuestionTarget(baseQuiz.length);
  let candidate = shuffleArray(baseQuiz).slice(0, targetCount);

  for (let attempt = 0; attempt < QUIZ_MAX_GENERATION_ATTEMPTS; attempt++) {
    const leadSignature = getLeadSignature(candidate);
    const candidateOrderSignature = candidate.map((q) => q.id).join(',');
    const repeatsLead = recentLeads.includes(leadSignature);
    const repeatsFullOrder = previousOrderSignature && candidateOrderSignature === previousOrderSignature;

    if (!repeatsLead && !repeatsFullOrder) {
      break;
    }

    candidate = shuffleArray(baseQuiz).slice(0, targetCount);
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
    const recentAttempts = await Progress.getRecentQuizAttemptsForLevel(
      userId,
      levelId,
      QUIZ_RECENT_ATTEMPTS_FOR_ADAPTIVE
    );
    const adaptiveDifficulty = getRecommendedDifficultyFromAttempts(recentAttempts);
    const quizPool = buildQuizPoolForLevel(level);
    const randomizedQuiz = buildQuizForAttempt(req, levelId, quizPool, adaptiveDifficulty);
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

    res.render('level', {
      level: {
        ...level,
        quiz: randomizedQuiz,
      },
      adaptiveDifficulty: getDifficultyLabel(adaptiveDifficulty),
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
