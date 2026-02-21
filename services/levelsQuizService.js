const QUIZ_LEAD_SIZE = 3;
const QUIZ_MAX_GENERATION_ATTEMPTS = 10;
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
    const clue =
      Array.isArray(lesson.keyPoints) && lesson.keyPoints.length > 0
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
  const source =
    lessonDerived.length >= QUIZ_QUESTIONS_PER_ATTEMPT
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

  if (
    recentTwo.length === 2 &&
    recentTwoAvg >= 88 &&
    (avgSecondsPerQuestion || 0) <= FAST_SECONDS_PER_QUESTION
  ) {
    return 'hard';
  }

  if (avgScore >= 82 && (avgSecondsPerQuestion || 0) <= FAST_SECONDS_PER_QUESTION) {
    return 'hard';
  }

  if (
    avgScore < 60 ||
    (avgSecondsPerQuestion && avgSecondsPerQuestion >= SLOW_SECONDS_PER_QUESTION)
  ) {
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

  const targetCount = getAdaptiveQuestionTarget(baseQuiz.length);
  let candidate = shuffleArray(baseQuiz).slice(0, targetCount);

  for (let attempt = 0; attempt < QUIZ_MAX_GENERATION_ATTEMPTS; attempt++) {
    const leadSignature = getLeadSignature(candidate);
    const candidateOrderSignature = candidate.map((q) => q.id).join(',');
    const repeatsLead = recentLeads.includes(leadSignature);
    const repeatsFullOrder =
      previousOrderSignature && candidateOrderSignature === previousOrderSignature;

    if (!repeatsLead && !repeatsFullOrder) {
      break;
    }

    candidate = shuffleArray(baseQuiz).slice(0, targetCount);
  }

  return candidate;
}

module.exports = {
  QUIZ_LEAD_SIZE,
  QUIZ_RECENT_ATTEMPTS_FOR_ADAPTIVE,
  buildQuizPoolForLevel,
  buildQuizForAttempt,
  getAdaptiveQuestionTarget,
  getDifficultyLabel,
  getRecommendedDifficultyFromAttempts,
  normalizeDifficulty,
};
