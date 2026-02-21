const {
  QUIZ_RECENT_ATTEMPTS_FOR_ADAPTIVE,
  getDifficultyLabel,
  getRecommendedDifficultyFromAttempts,
} = require('./levelsQuizService');

const FAST_SECONDS_PER_QUESTION = 22;

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
      ? Math.round(
        levelAttempts.reduce((sum, item) => sum + (Number(item.score) || 0), 0) /
            levelAttempts.length
      )
      : null;
    const avgSecondsPerQuestion = levelAttempts.length
      ? getAverageSecondsPerQuestion(levelAttempts)
      : null;
    const nextDifficulty = getRecommendedDifficultyFromAttempts(
      levelAttempts.slice(0, QUIZ_RECENT_ATTEMPTS_FOR_ADAPTIVE)
    );
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

  const strengthIds = new Set(strengths.map((item) => item.levelId));

  const weakAreas = [...ranked]
    .filter((item) => !strengthIds.has(item.levelId))
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
    recommendedLevel =
      levels.find((level) => !progressByLevel[level.id]?.completed) || levels[0] || null;
    reason = 'Continue your learning path with the next available level.';
  }

  let recommendedNextLesson = null;
  if (recommendedLevel) {
    const lessons = Array.isArray(recommendedLevel.lessons) ? recommendedLevel.lessons : [];
    if (lessons.length > 0) {
      const lessonIndex =
        primaryWeak && primaryWeak.avgScore !== null && primaryWeak.avgScore < 60
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

module.exports = {
  buildDashboardAnalytics,
};
