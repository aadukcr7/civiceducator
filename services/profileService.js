const levelsStore = require('../data/levelsStore');
const Progress = require('../models/Progress');
const User = require('../models/User');

async function getProfileViewModel(userId, query = {}) {
  const [user, levels, progressList, attempts] = await Promise.all([
    User.findById(userId),
    levelsStore.getLevels(),
    Progress.getAllProgress(userId),
    Progress.getRecentQuizAttempts(userId, 200),
  ]);

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
  attempts.forEach((attempt) => {
    studiedLevelIds.add(Number(attempt.level_id));
  });

  const attemptsByLevel = attempts.reduce((acc, attempt) => {
    const key = Number(attempt.level_id);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(attempt);
    return acc;
  }, {});

  const studiedLevels = Array.from(studiedLevelIds)
    .map((levelId) => {
      const level = levelById[levelId];
      if (!level) {
        return null;
      }

      const levelAttempts = attemptsByLevel[levelId] || [];
      const bestScore = levelAttempts.length
        ? Math.max(...levelAttempts.map((item) => Number(item.score) || 0))
        : null;

      return {
        id: level.id,
        title: level.title,
        icon: level.icon,
        lessonsCount: Array.isArray(level.lessons) ? level.lessons.length : 0,
        attemptsCount: levelAttempts.length,
        bestScore,
        lastAttemptAt: levelAttempts[0]?.created_at || null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.attemptsCount - a.attemptsCount || a.id - b.id);

  const lessonsStudiedCount = studiedLevels.reduce((sum, level) => sum + level.lessonsCount, 0);
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((item) => (Number(item.score) || 0) >= 70).length;
  const averageScore = totalAttempts
    ? Math.round(
      attempts.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / totalAttempts
    )
    : 0;
  const bestScoreOverall = totalAttempts
    ? Math.max(...attempts.map((item) => Number(item.score) || 0))
    : 0;
  const totalQuestionsAttempted = attempts.reduce(
    (sum, item) => sum + (Number(item.total_questions) || 0),
    0
  );
  const totalCorrectAnswers = attempts.reduce(
    (sum, item) => sum + (Number(item.correct_count) || 0),
    0
  );

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
      totalAttempts,
      passedAttempts,
      averageScore,
      bestScoreOverall,
      totalQuestionsAttempted,
      totalCorrectAnswers,
    },
    studiedLevels,
    quizAttempts,
  };
}

module.exports = {
  getProfileViewModel,
};
