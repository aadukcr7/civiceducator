const levelsStore = require('../data/levelsStore');
const Progress = require('../models/Progress');
const User = require('../models/User');

const PROFILE_ATTEMPTS_PAGE_SIZE = 15;

function parsePage(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function getProfileViewModel(userId, query = {}) {
  const currentPage = parsePage(query.attemptPage);
  const [user, levels, progressList, totalAttemptsCount, attemptsSummary, attemptStatsByLevel] = await Promise.all([
    User.findById(userId),
    levelsStore.getLevels(),
    Progress.getAllProgress(userId),
    Progress.countQuizAttempts(userId),
    Progress.getQuizAttemptSummary(userId),
    Progress.getAttemptStatsByLevel(userId),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalAttemptsCount / PROFILE_ATTEMPTS_PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const attemptsOffset = (page - 1) * PROFILE_ATTEMPTS_PAGE_SIZE;
  const attempts = await Progress.getQuizAttemptsPage(
    userId,
    PROFILE_ATTEMPTS_PAGE_SIZE,
    attemptsOffset
  );

  const levelById = levels.reduce((acc, level) => {
    acc[level.id] = level;
    return acc;
  }, {});

  const completedLevelsCount = progressList.filter((item) => item.completed).length;
  const studiedLevelIds = new Set();
  progressList.forEach((item) => {
    if (item.completed || item.score !== null) {
      studiedLevelIds.add(Number(item.level_id));
    }
  });
  const attemptStatsByLevelId = attemptStatsByLevel.reduce((acc, item) => {
    acc[Number(item.level_id)] = {
      attemptsCount: Number(item.attempts_count) || 0,
      bestScore: item.best_score !== null ? Number(item.best_score) : null,
    };
    studiedLevelIds.add(Number(item.level_id));
    return acc;
  }, {});

  const studiedLevels = Array.from(studiedLevelIds)
    .map((levelId) => {
      const level = levelById[levelId];
      if (!level) {
        return null;
      }

      const levelAttemptStats = attemptStatsByLevelId[levelId] || {
        attemptsCount: 0,
        bestScore: null,
      };

      return {
        id: level.id,
        title: level.title,
        icon: level.icon,
        lessonsCount: Array.isArray(level.lessons) ? level.lessons.length : 0,
        attemptsCount: levelAttemptStats.attemptsCount,
        bestScore: levelAttemptStats.bestScore,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.attemptsCount - a.attemptsCount || a.id - b.id);

  const lessonsStudiedCount = studiedLevels.reduce((sum, level) => sum + level.lessonsCount, 0);

  const quizAttempts = attempts.map((attempt) => {
    const level = levelById[Number(attempt.level_id)];
    return {
      ...attempt,
      levelTitle: level?.title || `Level ${attempt.level_id}`,
    };
  });

  return {
    user,
    query: {
      deleteError: query.deleteError || null,
      resetError: query.resetError || null,
      resetSuccess: query.resetSuccess || null,
    },
    summary: {
      levelsStudiedCount: studiedLevels.length,
      lessonsStudiedCount,
      levelsCompletedCount: completedLevelsCount,
      totalAttempts: attemptsSummary.totalAttempts,
      passedAttempts: attemptsSummary.passedAttempts,
      averageScore: attemptsSummary.averageScore,
      bestScoreOverall: attemptsSummary.bestScoreOverall,
      totalQuestionsAttempted: attemptsSummary.totalQuestionsAttempted,
      totalCorrectAnswers: attemptsSummary.totalCorrectAnswers,
    },
    studiedLevels,
    quizAttempts,
    attemptsPagination: {
      page,
      pageSize: PROFILE_ATTEMPTS_PAGE_SIZE,
      totalItems: totalAttemptsCount,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    },
  };
}

module.exports = {
  getProfileViewModel,
};
